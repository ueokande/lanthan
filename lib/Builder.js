'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { Builder: WebDriverBuilder } = require('selenium-webdriver');

const AddonBuilder = require('./addon/AddonBuilder');
const Lanthan = require('./Lanthan');
const WebExtDriver = require('./WebExtDriver');

class Builder {
  constructor(webdriverBuilder) {
    this.webdriverBuilder = webdriverBuilder.setFirefoxOptions({
      prefs: {
        'devtools.chrome.enabled': true,
        'devtools.debugger.remote-enabled': true,
      },
      log: {
        level: 'info'
      }
    });
  }

  static forBrowser(browser) {
    if (browser !== 'firefox') {
      throw new Error(`Browser '${browser} not supported`);
    }
    return new Builder(
      new WebDriverBuilder().forBrowser(browser),
    );
  }

  setFirefoxOptions(options) {
    this.webdriverBuilder.setFirefoxOptions(options);
    return this;
  }

  withCapabilities(capabilities) {
    this.webdriverBuilder.withCapabilities(capabilities);
    return this;
  }

  async build(spy = false) {
    let webdriver = this.webdriverBuilder.build();
    let webextdriver = new WebExtDriver();
    webextdriver.setup();

    let addon = await this.addonBuilder(spy).build();
    let addonPath = path.join(os.tmpdir(), 'lanthan-driver.zip');
    fs.writeFileSync(addonPath, addon);
    await webdriver.installAddon(addonPath, true);
    fs.unlinkSync(addonPath);

    await webextdriver.wait();
    return new Lanthan(webdriver, webextdriver);
  }

  addonBuilder(spy) {
    if (spy) {
      let driverPath = path.join(__dirname, '..', 'addon', 'background.js');
      let driverContent = fs.readFileSync(driverPath);
      return new AddonBuilder(spy)
        .addPermission('nativeMessaging')
        .overrideProperty('applications', {
          gecko: { id: 'lanthan-driver@i-beam.org' }
        })
        .addBackgroundScript('background.js', driverContent);
    }
    let baseDir = path.join(__dirname, '..', 'addon');
    return new AddonBuilder(baseDir);
  }
}

module.exports = Builder;

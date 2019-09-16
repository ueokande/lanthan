import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Builder as WebDriverBuilder } from 'selenium-webdriver';
import { Options as FirefoxOptions, Driver as FirefoxDriver } from 'selenium-webdriver/firefox';

import AddonBuilder from './addon/AddonBuilder';
import Lanthan from './Lanthan';
import WebExtDriver from './WebExtDriver';

interface Options extends FirefoxOptions {
  setPreference(key: string, value: string | number | boolean): Options;
}

interface Driver extends FirefoxDriver {
  installAddon(path: string, temporary: boolean): Promise<string>;
}

class Builder {
  private spiedAddon: string | undefined;

  private webdriverBuilder: WebDriverBuilder;

  constructor(webdriverBuilder: WebDriverBuilder) {
    let opts: Options = (new FirefoxOptions() as Options)
      .setPreference('devtools.chrome.enabled', true)
      .setPreference('devtools.debugger.remote-enabled', true);
    this.webdriverBuilder = webdriverBuilder.setFirefoxOptions(opts);
  }

  static forBrowser(browser: string): Builder {
    if (browser !== 'firefox') {
      throw new Error(`Browser '${browser} not supported`);
    }
    return new Builder(
      new WebDriverBuilder().forBrowser(browser),
    );
  }

  spyAddon(dir: string): Builder {
    this.spiedAddon = dir;
    return this;
  }

  async build(): Promise<Lanthan> {
    let webdriver = (await this.webdriverBuilder.build()) as Driver;
    let webextdriver = new WebExtDriver();
    webextdriver.setup();

    let addon = await this.addonBuilder().build();
    let addonPath = path.join(os.tmpdir(), 'lanthan-driver.zip');
    fs.writeFileSync(addonPath, addon);
    await webdriver.installAddon(addonPath, true);
    fs.unlinkSync(addonPath);

    await webextdriver.wait();
    return new Lanthan(webdriver, webextdriver);
  }

  private addonBuilder(): AddonBuilder {
    if (this.spiedAddon) {
      let driverPath = path.join(__dirname, '..', 'addon', 'background.js');
      let driverContent = fs.readFileSync(driverPath);
      return new AddonBuilder(this.spiedAddon)
        .addPermission('nativeMessaging')
        .setBrowserSpecificSettings('gecko', 'id', 'lanthan-driver@i-beam.org')
        .addBackgroundScript('lanthan-driver.js', driverContent);
    }
    let baseDir = path.join(__dirname, '..', 'addon');
    return new AddonBuilder(baseDir);
  }
}

export default Builder;

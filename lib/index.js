'use strict';

const GeckoDriver = require('./webdriver/GeckoDriver');
const GeckoSession = require('./webdriver/GeckoSession');
const webext = require('./webext/api');
const path = require('path');
const config = require('./config');
const os = require('os');
const fs = require('fs');
const request = require('request-promise-native');
const native = require('./webext/native');
const Key = require('./webdriver/Key');
const AddonBuilder = require('./addon/AddonBuilder');
const GeckoDriverRunner = require('./geckodriver/Runner');

const configPath = path.join(os.tmpdir(), 'lanthan-driver.json');

class Core {
  constructor(session, browser, geckodriver) {
    this.session = session;
    this.browser = browser;
    this.geckodriver = geckodriver;
  }

  async close() {
    fs.unlinkSync(configPath);
    native.removeManifest();
    await this.session.close();

    this.geckodriver.kill();
  }
}

const newCapabilities = (binary, prefs) => {
  let firefoxOptions = {
    prefs: Object.assign({
      'devtools.chrome.enabled': true,
      'devtools.debugger.remote-enabled': true,
    }, prefs),
    log: {
      level: 'info'
    }
  };
  if (binary) {
    firefoxOptions.binary = binary;
  }

  return {
    alwaysMatch: {
      'moz:firefoxOptions': firefoxOptions,
    }
  };
};

const waitForSucessfully = async(fn, timeout = 3000, interval = 100) => {
  let start = Date.now();
  let loop = async() => {
    try {
      await fn();
    } catch (err) {
      if (Date.now() - start > timeout) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      await loop();
    }
  };
  await loop();
};

// eslint-disable-next-line max-statements
const firefox = async({
  binary,
  prefs = {},
  spy,
  builderf,
} = {}) => {
  let geckodriver = new GeckoDriverRunner();
  geckodriver.start();
  await geckodriver.waitReady();

  let settings = config.saveTo(configPath, {
    logFile: path.join(process.cwd(), 'lanthan-driver.log'),
  });
  native.createManifest();

  let driver = new GeckoDriver();
  let session = await GeckoSession.create(driver, newCapabilities(binary, prefs));

  let builder = null;
  if (spy) {
    let driverPath = path.join(__dirname, '..', 'addon', 'background.js');
    let driverContent = fs.readFileSync(driverPath);
    builder = new AddonBuilder(spy)
      .addPermission('nativeMessaging')
      .overrideProperty('applications', {
        gecko: { id: 'lanthan-driver@i-beam.org' }
      })
      .addBackgroundScript('background.js', driverContent);
  } else {
    let baseDir = path.join(__dirname, '..', 'addon');
    builder = new AddonBuilder(baseDir);
  }
  if (builderf) {
    builderf(builder);
  }
  await session.installAddon(await builder.build());

  let browser = webext.create(settings.address, settings.port);

  await waitForSucessfully(() => {
    return request({
      url: `http://127.0.0.1:${settings.port}/health`,
      method: 'GET',
      json: {},
    });
  });
  return new Core(session, browser, geckodriver);
};

module.exports = {
  firefox,
  Key,
};

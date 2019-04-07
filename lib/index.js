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

const configPath = path.join(os.tmpdir(), 'lanthan-driver.json');

class Core {
  constructor(session, browser) {
    this.session = session;
    this.browser = browser;
  }

  async close() {
    fs.unlinkSync(configPath);
    native.removeManifest();
    await this.session.close();
  }
}

const newCapabilities = (binary, prefs) => {
  return {
    alwaysMatch: {
      'moz:firefoxOptions': {
        binary,
        prefs: Object.assign({
          'devtools.chrome.enabled': true,
          'devtools.debugger.remote-enabled': true,
        }, prefs),
        log: {
          level: 'info'
        }
      }
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

const firefox = async({
  binary = 'firefox',
  prefs = {},
} = {}) => {
  let settings = config.saveTo(configPath, {
    logFile: path.join(process.cwd(), 'lanthan-driver.log'),
  });

  native.createManifest();

  let driver = new GeckoDriver();
  let session = await GeckoSession.create(driver, newCapabilities(binary, prefs));

  let addonPath = path.join(__dirname, '..', 'addon');
  await session.installAddonFromPath(addonPath);

  let browser = webext.create(settings.address, settings.port);

  await waitForSucessfully(() => {
    return request({
      url: `http://127.0.0.1:${settings.port}/health`,
      method: 'GET',
      json: {},
    });
  });
  return new Core(session, browser);
};

module.exports = {
  firefox,
  Key,
};

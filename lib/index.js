'use strict';

const WebDriver = require('./webdriver/WebDriver');
const Session = require('./webdriver/Session');
const webext = require('./webext/api');
const path = require('path');
const config = require('./config');
const os = require('os');
const fs = require('fs');
const native = require('./webext/native');

const configPath = path.join(os.tmpdir(), 'webext-driver.json');

class Core {
  constructor(session, browser) {
    this.session = session;
    this.browser = browser;
  }

  static async newSession() {
    let settings = config.saveTo(configPath, {
      logFile: path.join(process.cwd(), 'webext-server.log'),
    });

    native.createManifest();

    let webdriver = new WebDriver();
    let session = await Session.create(webdriver);

    let addonPath = path.join(__dirname, '..', 'addon');
    session.installAddon(addonPath);

    let browser = webext.create(settings.address, settings.port);

    return new Core(session, browser);
  }

  async close() {
    fs.unlinkSync(configPath);
    native.removeManifest();
    await this.session.close();
  }

  getSession() {
    return this.session;
  }

  getBrowser() {
    return this.browser;
  }
}

module.exports = Core;

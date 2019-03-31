'use strict';

const WebDriver = require('./webdriver/WebDriver');
const Session = require('./webdriver/Session');
const webext = require('./webext/api');
const path = require('path');
const config = require('./config');
const os = require('os');
const fs = require('fs');
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

const firefox = async() => {
  let settings = config.saveTo(configPath, {
    logFile: path.join(process.cwd(), 'lanthan-driver.log'),
  });

  native.createManifest();

  let webdriver = new WebDriver();
  let session = await Session.create(webdriver);

  let addonPath = path.join(__dirname, '..', 'addon');
  session.installAddon(addonPath);

  let browser = webext.create(settings.address, settings.port);

  return new Core(session, browser);
};

module.exports = {
  firefox,
  Key,
};

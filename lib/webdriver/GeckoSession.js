'use strict';

const webext = require('web-ext').default;
const fs = require('fs');
const os = require('os');
const Session = require('./Session');

class GeckoSession extends Session {
  static async create(driver, capabilities) {
    let sessionId = await driver.newSession(capabilities);
    return new GeckoSession(sessionId, driver);
  }

  async installAddon(path) {
    let built = await webext.cmd.build({
      sourceDir: path,
      artifactsDir: os.tmpdir(),
      overwriteDest: false,
    });
    let data = fs.readFileSync(built.extensionPath);
    fs.unlinkSync(built.extensionPath);
    await this.driver.installAddon(this.sessionId, data, true);
  }
}

module.exports = GeckoSession;

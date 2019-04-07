'use strict';

const Session = require('./Session');
const AddonBuilder = require('../addon/firefox');


class GeckoSession extends Session {
  static async create(driver, capabilities) {
    let sessionId = await driver.newSession(capabilities);
    return new GeckoSession(sessionId, driver);
  }

  async installAddon(p) {
    let data = await new AddonBuilder(p).build();
    await this.driver.installAddon(this.sessionId, data, true);
  }
}

module.exports = GeckoSession;

'use strict';

const Session = require('./Session');
const AddonBuilder = require('../addon/AddonBuilder');

class GeckoSession extends Session {
  static async create(driver, capabilities) {
    let sessionId = await driver.newSession(capabilities);
    return new GeckoSession(sessionId, driver);
  }

  async installAddonFromPath(path) {
    let data = await new AddonBuilder(path).build();
    return this.installAddon(data);
  }

  async installAddon(data) {
    await this.driver.installAddon(this.sessionId, data, true);
  }
}

module.exports = GeckoSession;

const WebDriver = require('./webdriver/WebDriver');
const Session = require('./webdriver/Session');
const path = require('path');

class Core {
  constructor(session) {
    this._session = session;
  }

  static async newSession() {
    let webdriver = new WebDriver();
    let session = await Session.create(webdriver);
    return new Core(session);
  }

  async close() {
    await this._session.close();
  }

  session() {
    return this._session;
  }

  browser() {
    throw new Error('browser not implemented');
  }
}

module.exports = Core;

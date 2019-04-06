'use strict';

const Element = require('./Element');
const webext = require('web-ext').default;
const os = require('os');
const fs = require('fs');

class Session {
  constructor(sessionId, driver) {
    this.sessionId = sessionId;
    this.driver = driver;
  }

  static async create(driver, capabilities) {
    let sessionId = await driver.newSession(capabilities);
    return new Session(sessionId, driver);
  }

  async close() {
    await this.driver.deleteSession(this.sessionId);
  }

  async installAddon(path) {
    let built = await webext.cmd.build({
      sourceDir: path,
      artifactsDir: os.tmpdir(),
      overwriteDest: false,
    });
    let data = fs.readFileSync(built.extensionPath);
    fs.unlinkSync(built.extensionPath);
    await this.driver.mozInstallAddon(this.sessionId, data, true);
  }

  async findElementByCSS(css) {
    let id = await this.driver.findElement(this.sessionId, 'css selector', css);
    return new Element(this.driver, this.sessionId, id);
  }

  async findElementsByCSS(css) {
    let ids = await this.driver.findElements(
      this.sessionId, 'css selector', css);
    return ids.map(id => new Element(this.driver, this.sessionId, id));
  }

  async navigateTo(url) {
    await this.driver.navigateTo(this.sessionId, url);
  }

  getWindowHandle() {
    return this.driver.getWindowHandle(this.sessionId);
  }

  newWindow(url = undefined, type = 'tab') {
    return this.driver.newWindow(this.sessionId, url, type);
  }

  switchToWindow(handle) {
    return this.driver.switchToWindow(this.sessionId, handle);
  }

  getWindowHandles() {
    return this.driver.getWindowHandles(this.sessionId);
  }

  switchToFrame(id) {
    return this.driver.switchToFrame(this.sessionId, id);
  }

  switchToParentFrame() {
    return this.driver.switchToParentFrame(this.sessionId);
  }

  executeScript(script) {
    return this.driver.executeScript(this.sessionId, script);
  }
}

module.exports = Session;

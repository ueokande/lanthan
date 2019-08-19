'use strict';

const Element = require('./Element');

class Session {
  constructor(sessionId, driver) {
    this.sessionId = sessionId;
    this.driver = driver;
  }

  async close() {
    await this.driver.deleteSession(this.sessionId);
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

  dismissAlert() {
    return this.driver.dismissAlert(this.sessionId);
  }

  acceptAlert() {
    return this.driver.acceptAlert(this.sessionId);
  }

  getAlertText() {
    return this.driver.getAlertText(this.sessionId);
  }

  sendAlertText(text) {
    return this.driver.sendAlertText(this.sessionId, text);
  }
}

module.exports = Session;

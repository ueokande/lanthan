'use strict';

class Element {
  constructor(driver, sessionId, elementId) {
    this.driver = driver;
    this.sessionId = sessionId;
    this.elementId = elementId;
  }

  sendKeys(...keys) {
    this.driver.sendKeys(
      this.sessionId, Object.values(this.elementId)[0], ...keys
    );
  }
}

module.exports = Element;

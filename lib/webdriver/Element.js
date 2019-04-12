'use strict';

class Element {
  constructor(driver, sessionId, elementId) {
    this.driver = driver;
    this.sessionId = sessionId;
    this.elementId = elementId;
  }

  getAttribute(name) {
    return this.driver.getAttribute(
      this.sessionId, Object.values(this.elementId)[0], name,
    );
  }

  getStyle(name) {
    return this.driver.getStyle(
      this.sessionId, Object.values(this.elementId)[0], name,
    );
  }

  getText() {
    return this.driver.getText(
      this.sessionId, Object.values(this.elementId)[0],
    );
  }

  getTagName() {
    return this.driver.getTagName(
      this.sessionId, Object.values(this.elementId)[0],
    );
  }

  sendKeys(...keys) {
    return this.driver.sendKeys(
      this.sessionId, Object.values(this.elementId)[0], ...keys
    );
  }

  click() {
    return this.driver.click(
      this.sessionId, Object.values(this.elementId)[0],
    );
  }

  isDisplayed() {
    return this.driver.isElementDisplayed(
      this.sessionId, Object.values(this.elementId)[0],
    );
  }

  isSelected() {
    return this.driver.isElementSelected(
      this.sessionId, Object.values(this.elementId)[0],
    );
  }
}

module.exports = Element;

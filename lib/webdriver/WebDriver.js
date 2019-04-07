'use strict';

const request = require('request-promise-native');

class WebDriver {
  constructor(port, address = '127.0.0.1') {
    this.endpoint = `http://${address}:${port}`;
  }

  async newSession(capabilities) {
    let response = await request({
      url: `${this.endpoint}/session`,
      method: 'POST',
      json: { capabilities },
    });
    return response.value.sessionId;
  }

  async deleteSession(sessionId) {
    await request({
      url: `${this.endpoint}/session/${sessionId}`,
      method: 'DELETE',
      json: {},
    });
  }

  async getWindowHandles(sessionId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/window/handles`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async getWindowHandle(sessionId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/window`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async switchToWindow(sessionId, handle) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/window`,
      method: 'POST',
      json: { handle },
    });
    return response.value;
  }

  async switchToFrame(sessionId, id) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/frame`,
      method: 'POST',
      json: { id },
    });
    return response.value;
  }

  async switchToParentFrame(sessionId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/frame/parent`,
      method: 'POST',
      json: {},
    });
    return response.value;
  }

  async findElement(sessionId, using, selector) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element`,
      method: 'POST',
      json: { using: using, value: selector },
    });
    return response.value;
  }

  async findElements(sessionId, using, selector) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/elements`,
      method: 'POST',
      json: { using: using, value: selector },
    });
    return response.value;
  }

  async navigateTo(sessionId, url) {
    await request({
      url: `${this.endpoint}/session/${sessionId}/url`,
      method: 'POST',
      json: { url },
    });
  }

  async getAttribute(sessionId, elementId, name) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/attribute/${name}`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async getStyle(sessionId, elementId, name) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/css/${name}`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async getText(sessionId, elementId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/text`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async getTagName(sessionId, elementId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/name`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async sendKeys(sessionId, elementId, ...keys) {
    await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/value`,
      method: 'POST',
      json: {
        text: keys.join(''),
        value: keys,
      },
    });
  }

  async isElementDisplayed(sessionId, elementId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/displayed`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async isElementSelected(sessionId, elementId) {
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/element/${elementId}/selected`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async executeScript(sessionId, script) {
    let scriptData = script;
    if (typeof script === 'function') {
      scriptData = 'return (' + script + ').apply(null, arguments);';
    }
    let response = await request({
      url: `${this.endpoint}/session/${sessionId}/execute/sync`,
      method: 'POST',
      json: {
        script: scriptData,
        args: [],
      }
    });
    return response.value;
  }
}

module.exports = WebDriver;

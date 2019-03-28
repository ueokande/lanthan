const request = require('request-promise-native');

class WebDriver {
  constructor(address = '127.0.0.1', port = 4444) {
    this.endpoint = `http://${address}:${port}`
  }

  async newSession() {
    let response = await request({
      url:`${this.endpoint}/session`,
      method: 'POST',
      json: {},
    });
    return response.value.sessionId;
  }

  async deleteSession(sessionId) {
    await request({
      url:`${this.endpoint}/session/${sessionId}`,
      method: 'DELETE',
      json: {},
    });
  }

  async getWindows(sessionId) {
    let response = await request({
      url:`${this.endpoint}/session/${sessionId}/window/handles`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async getWindow(sessionId) {
    let response = await request({
      url:`${this.endpoint}/session/${sessionId}/window`,
      method: 'GET',
      json: {},
    });
    return response.value;
  }

  async findElement(sessionId, using, selector) {
    let response = await request({
      url:`${this.endpoint}/session/${sessionId}/element`,
      method: 'POST',
      json: { using: using, value: selector },
    })
    return response.value;
  }

  async findElements(sessionId, using, selector) {
    let response = await request({
      url:`${this.endpoint}/session/${sessionId}/elements`,
      method: 'POST',
      json: { using: using, value: selector },
    })
    return response.value;
  }

  async navigateTo(sessionId, url) {
    await request({
      url:`${this.endpoint}/session/${sessionId}/url`,
      method: 'POST',
      json: { url },
    })
  }

  async sendKeys(sessionId, elementId, ...keys) {
    console.log('url', `${this.endpoint}/session/${sessionId}/element/${elementId}/value`);
    await request({
      url:`${this.endpoint}/session/${sessionId}/element/${elementId}/value`,
      method: 'POST',
      json: {
        text: keys.join(''),
        value: keys,
      },
    })
  }
}

module.exports = WebDriver;

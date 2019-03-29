const request = require('request-promise-native');

class WebDriver {
  constructor(address = '127.0.0.1', port = 4444) {
    this.endpoint = `http://${address}:${port}`
  }

  async newSession(
    binary = 'firefox',
    prefs = {}
  ) {
    let capabilities = {
      alwaysMatch: {
        'moz:firefoxOptions': {
          binary,
          prefs: {
            'devtools.chrome.enabled': true,
            'devtools.debugger.remote-enabled': true,
            ...prefs,
          },
          log: {
            level: 'info'
          }
        }
      }
    };
    let response = await request({
      url:`${this.endpoint}/session`,
      method: 'POST',
      json: { capabilities },
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
    await request({
      url:`${this.endpoint}/session/${sessionId}/element/${elementId}/value`,
      method: 'POST',
      json: {
        text: keys.join(''),
        value: keys,
      },
    })
  }

  async executeScript(sessionId, script) {
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    let response = await request({
      url:`${this.endpoint}/session/${sessionId}/execute/sync`,
      method: 'POST',
      json: {
        script: script,
        args: [],
      }
    })
    return response.value;
  }

  async mozInstallAddon(sessionId, data, temporary = false) {
    await request({
      url:`${this.endpoint}/session/${sessionId}/moz/addon/install`,
      method: 'POST',
      json: {
        addon: data.toString('base64'),
        temporary,
      },
    })
  }
}

module.exports = WebDriver;

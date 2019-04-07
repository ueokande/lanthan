'use strict';

const request = require('request-promise-native');
const WebDriver = require('./WebDriver');

class GeckoDriver extends WebDriver {
  constructor(port = 4444, address = '127.0.0.1') {
    super(port, address);
  }

  async installAddon(sessionId, data, temporary = false) {
    await request({
      url: `${this.endpoint}/session/${sessionId}/moz/addon/install`,
      method: 'POST',
      json: {
        addon: data.toString('base64'),
        temporary,
      },
    });
  }
}

module.exports = GeckoDriver;

'use strict';

const path = require('path');

const config = require('./config');
const native = require('./webext/native');
const request = require('request-promise-native');
const webext = require('./webext/api');

const waitForSucessfully = async(fn, timeout = 3000, interval = 100) => {
  let start = Date.now();
  let loop = async() => {
    try {
      await fn();
    } catch (err) {
      if (Date.now() - start > timeout) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      await loop();
    }
  };
  await loop();
};

class WebExtDriver {
  constructor() {
    this.address = '';
    this.port = -1;
  }

  setup() {
    let settings = config.save({
      logFile: path.join(process.cwd(), 'lanthan-driver.log'),
    });
    native.createManifest();
    this.address = settings.address;
    this.port = settings.port;
  }

  wait() {
    return waitForSucessfully(() => {
      return request({
        url: `http://127.0.0.1:${this.port}/health`,
        method: 'GET',
        json: {},
      });
    });
  }

  getBrowser() {
    return webext.create(this.address, this.port);
  }

  quit() {
    config.remove();
    native.removeManifest();
  }
}

module.exports = WebExtDriver;

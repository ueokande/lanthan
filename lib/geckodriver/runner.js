'use strict';

const { spawn } = require('child_process');
const net = require('net');

class Runner {
  constructor({
    port = 4444,
    binary = 'geckodriver',
  } = {}) {
    this.port = port;
    this.binary = binary;

    this.ps = null;
  }

  start() {
    if (this.ps) {
      throw Error('geckodriver is already running');
    }

    this.ps = spawn(this.binary, ['--port', this.port]);
  }

  async waitReady(timeout = 1000) {
    let deadline = Date.now() + timeout;

    if (!this.ps) {
      throw Error('geckodriver is not started');
    }
    const loop = () => new Promise((resolve, reject) => {
      let sock = new net.Socket();
      sock.connect(this.port, '127.0.0.1', () => {
        sock.destroy();
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      sock.on('error', (err) => {
        if (deadline - Date.now() < 0) {
          reject(err);
          return;
        }
        setTimeout(() => {
          resolve(loop());
        }, 100);
      });
    });
    await loop();
  }

  kill() {
    this.ps.kill();
    this.ps = undefined;
  }
}

module.exports = Runner;

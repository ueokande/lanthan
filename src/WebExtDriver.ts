import * as path from 'path';
import request from 'request-promise-native';

import * as config from './config';
import * as native from './webext/native';
import * as webext from './webext/api';


const waitForSucessfully = async(
  fn: () => void,
  timeout = 3000,
  interval = 100
): Promise<void> => {
  const start = Date.now();
  const loop = async(): Promise<void> => {
    try {
      await fn();
    } catch (err) {
      if (Date.now() - start > timeout) {
        throw err;
      }
      await new Promise((resolve): void => { setTimeout(resolve, interval) });
      await loop();
    }
  };
  await loop();
};

class WebExtDriver {
  private address: string;

  private port: number;

  constructor() {
    this.address = '';
    this.port = -1;
  }

  setup(): void {
    const settings = config.save({
      logFile: path.join(process.cwd(), 'lanthan-driver.log'),
    });
    native.createManifest();
    this.address = settings.address;
    this.port = settings.port;
  }

  wait(): Promise<void> {
    return waitForSucessfully(() => {
      return request({
        url: `http://127.0.0.1:${this.port}/health`,
        method: 'GET',
        json: {},
      });
    });
  }

  getBrowser(): any {
    return webext.create(this.address, this.port);
  }

  quit(): void {
    config.remove();
    native.removeManifest();
  }
}

export default WebExtDriver;

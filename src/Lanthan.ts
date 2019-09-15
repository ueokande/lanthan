import { WebDriver } from 'selenium-webdriver';
import WebExtDriver from './WebExtDriver';

export default class Lanthan {
  constructor(
    private webdriver: WebDriver,
    private webextdriver: WebExtDriver,
  ) {
  }

  getWebExtBrowser(): any {
    return this.webextdriver.getBrowser();
  }

  getWebDriver(): WebDriver {
    return this.webdriver;
  }

  async quit() {
    await this.webextdriver.quit();
    await this.webdriver.quit();
  }
}


'use strict';

class Lanthan {
  constructor(webdriver, webextdriver) {
    this.webdriver = webdriver;
    this.webextdriver = webextdriver;
  }

  getWebExtBrowser() {
    return this.webextdriver.getBrowser();
  }

  getWebDriver() {
    return this.webdriver;
  }

  async quit() {
    await this.webextdriver.quit();
    await this.webdriver.quit();
  }
}

module.exports = Lanthan;

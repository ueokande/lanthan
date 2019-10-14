const { Builder } = require('lanthan');
const { WebDriver, By } = require('selenium-webdriver');
const assert = require('assert');

(async () => {
  let lanthan = await Builder
    .forBrowser('firefox')  // Lanthan currently supports only Firefox
    .build();

  // Get WebDriver API
  let webdriver = lanthan.getWebDriver();
  // Get WebExtensions API
  let browser = lanthan.getWebExtBrowser();

  // Open https://example.com/
  await webdriver.navigate().to('https://example.com/');

  let a = webdriver.findElement(By.css('a'));
  await a.click();

  // Assert curren tabs
  let tabs = await browser.tabs.query({});
  assert.strictEqual(tabs.length, 1);
  assert.strictEqual(tabs[0].url, 'https://www.iana.org/domains/reserved');

  await lanthan.quit();
})()

const { Builder } = require('lanthan');
const { WebDriver, By } = require('selenium-webdriver');
const assert = require('assert');
const path = require('path');

(async () => {
  let lanthan = await Builder
    .forBrowser('firefox')  // Lanthan currently supports only Firefox
    .spyAddon(path.join(__dirname, 'addon'))  // Spy to the addon
    .build();
  let webdriver = lanthan.getWebDriver();
  let browser = lanthan.getWebExtBrowser();

  // Press keys on example.com
  await webdriver.navigate().to('https://example.com/');
  await webdriver.findElement(By.css('body')).sendKeys('a');

  // Press keys on example.org
  await webdriver.navigate().to('https://example.org/');
  await webdriver.findElement(By.css('body')).sendKeys('1');
  await webdriver.findElement(By.css('body')).sendKeys('2');
  await webdriver.findElement(By.css('body')).sendKeys('3');

  // Assert counted keys
  let { count } = await browser.storage.local.get('count');
  assert.strictEqual(count['https://example.com'], 1);
  assert.strictEqual(count['https://example.org'], 3);
  assert.strictEqual(count['https://example.net'], undefined);

  await lanthan.quit();
})()


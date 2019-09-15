'use strict';

const { Builder } = require('../../../lib');
const assert = require('assert');
const server = require('../server');

describe('webext api integration', () => {
  let http;
  let lanthan;

  before(async() => {
    let sv = server.newApp();
    http = sv.listen(10101, '127.0.0.1');

    lanthan = await Builder.forBrowser('firefox').build();
  });

  after(async() => {
    if (lanthan) {
      await lanthan.quit();
    }
    http.close();
  });

  it('should invoke WebExtensions APIs', async() => {
    let webdriver = lanthan.getWebDriver();

    await webdriver.navigate().to('http://127.0.0.1:10101/#1');

    let browser = lanthan.getWebExtBrowser();
    let tabs = await browser.tabs.query({});
    assert.strictEqual(tabs.length, 1);
    assert.strictEqual(tabs[0].url, 'http://127.0.0.1:10101/#1');

    await browser.tabs.create({ url: 'http://127.0.0.1:10101/#2' });

    tabs = await browser.tabs.query({});
    assert.strictEqual(tabs.length, 2);
  });

  it('should returns error from browser', async() => {
    let browser = lanthan.getWebExtBrowser();
    try {
      await browser.tabs.query();
      assert.fail('unexpected success');
    } catch (e) {
      assert.strictEqual(e.message, 'Incorrect argument types for tabs.query.');
    }
  });
});

'use strict';

const lanthan = require('../../../lib');
const assert = require('power-assert');
const server = require('../server');

describe('webext', () => {
  let http;
  let firefox;
  let session;

  before(async() => {
    let sv = server.newApp();
    http = sv.listen(10101);

    firefox = await lanthan.firefox();
    session = firefox.session;

    await session.installAddon('../vim-vixen');
  });

  after(async() => {
    await firefox.close();
    http.close();
  });

  it('should invoke WebExtensions APIs', async() => {
    await session.navigateTo('http://127.0.0.1:10101/#1');

    let browser = firefox.browser;
    let tabs = await browser.tabs.query({});
    assert(tabs.length === 1);
    assert(tabs[0].url === 'http://127.0.0.1:10101/#1');

    await browser.tabs.create({ url: 'http://127.0.0.1:10101/#2' });

    tabs = await browser.tabs.query({});
    assert(tabs.length === 2);
  });

  it('should invoke WebExtensions APIs', async() => {
    let browser = firefox.browser;
    try {
      await browser.tabs.query();
      assert.fail('unexpected success');
      throw new Error('');
    } catch (e) {
      assert(e.message.includes(520));
    }
  });
});

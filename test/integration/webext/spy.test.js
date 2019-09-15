'use strict';

const assert = require('assert');
const path = require('path');

const { Builder } = require('../../../lib');

describe('webext spy integration', () => {
  let lanthan;

  after(async() => {
    await lanthan.quit();
  });

  it('should loads lanthan with spied addon', async() => {
    lanthan = await Builder
      .forBrowser('firefox')
      .spyAddon(path.join(__dirname, 'testdata', 'spy'))
      .build();

    let browser = lanthan.getWebExtBrowser();
    let items = await browser.storage.local.get('title');
    assert.strictEqual(items.title, 'alice in wonderland');
  });
});

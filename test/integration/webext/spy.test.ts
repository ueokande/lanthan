import * as assert from 'assert';
import * as path from 'path';

import { Builder, Lanthan } from '../../../src';

describe('webext spy integration', () => {
  let lanthan: Lanthan | undefined;

  after(async() => {
    if (lanthan) {
      await lanthan.quit();
    }
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

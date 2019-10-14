const { Builder } = require('lanthan');
const assert = require('assert');

(async () => {
  let lanthan = await Builder
    .forBrowser('firefox')  // Lanthan currently supports only Firefox
    .build();

  // Get WebExtensions API
  let browser = lanthan.getWebExtBrowser();

  // Create new tabs
  await browser.tabs.create({ url: 'https://example.com/' });
  await browser.tabs.create({ url: 'https://example.org/' });

  // Get all tabs;
  let tabs = await browser.tabs.query({});

  // Assert that the number of the tabs is three
  assert.strictEqual(tabs.length, 3);

  await lanthan.quit();
})()



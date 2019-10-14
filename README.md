# lanthan

Lanthan is a test framework for WebExtensions.  It provides a *remote*
WebExtensions API to enable web browser automation and assertion.  Lanthan
utilizes [selenium-webdriver][] to install and control your browser from the
local.

## Install

Install lanthan via [npm][] as the following:

```shell
$ npm install -D lanthan
```

or add a package on the `"devDependencies"` field of your `package.json`:

```json
{
  "devDependencies": {
    "lanthan": "0.0.2"
  }
}
```

## Quick start

There are four examples of lanthan usage.  You can see a full version of the
script in [`examples`][examples] directory.

### Setup and tear-down lanthan ([`examples/01_setup_teardown.js`][01_setup_teardown.js])

A `lanthan` package provides a builder class `Builder` to create a browser
session and APIs to access it.  Import `Builder` from `lanthan` package as the
following:

```javascript
// Common JS
const { Builder } = require('lanthan');

// ES Module
import { Builder } from 'lanthan';
```

The `Builder` provides a static method `forBrowser()` to initialize a builder
for the browser.  Only `"firefox"` is supported currently.  Then the `build()`
method launch a browser and asynchronously returns `Lanthan` object to access
the browser

```javascript
let lanthan = await Builder
  .forBrowser('firefox')  // Lanthan currently supports only Firefox
  .build();
```

To close the session of the browser, invoke `quit()` method:

```javascript
await lanthan.quit();
```

### Get a WebExtensions API ([`examples/02_webext_api.js`][02_webext_api.js])

The lanthan session provides a *remote* WebExtensions API.  The API is
compatible with WebExtensions, but the API is available outside of the browser.
That means the API lanthan allows you to control and assert a browser status on
the local (Node.js).

The `getWebExtBrowser()` of the `Lanthan` object returns an object which
provides WebExtensions API compatible object:

```javascript
// get WebExtensions API
let browser = lanthan.getWebExtBrowser();
```

For example, to create and get tabs by the API:

```javascript
// Create new tabs
await browser.tabs.create({ url: 'https://example.com/' });
await browser.tabs.create({ url: 'https://example.org/' });

// Get all tabs;
let tabs = await browser.tabs.query({});

// Assert that the number of the tabs is three
assert.strictEqual(tabs.length, 3);
```

### Get a WebDriver API ([`examples/03_webdriver_api.js`][03_webdriver_api.js])

The lanthan session also provides a WebDriver API.  That is convenient to make
test automation.  The WebDriver API allows you to sending key events, assert
DOM elements, execute JavaScript and so on.

The `getWebDriver()` of the `Lanthan` object returns an object which
provides selenium WebDriver API:

```javascript
// Get WebDriver API
let webdriver = lanthan.getWebDriver();
```

For example, to open a page and click an element:

```javascript
// Open https://example.com/
await webdriver.navigate().to('https://example.com/');

let a = webdriver.findElement(By.css('a'));
await a.click();
```

For more details of WebDriver API, see also [Selenium project][selenium-project-document]
and [selenium-webdriver documentation][selenium-webdriver-javascript-document].

### Spy an add-on ([`examples/04_spy_addon.js`][04_spy_addon.js])

Lanthan installs a daemon add-on to control Firefox remotely via HTTP.  The
daemon add-on is an independent add-on, but it can *spy* to existing add-on on
the local.  By the spying to the add-on, the lanthan's remote server is
mixed-in into the target add-on.  So remote WebExtensions API allows you to
access internal state such as local storage of the target add-on.

You can see a sample add-on in [`example/addon`][].  The add-on counts up
pressed keys and store counts to local storage by the page origin.  Lanthan
spied to the local add-on by `spyAddon()` and load it as a temporary add-on:

```javascript
let lanthan = await Builder
  .forBrowser('firefox')  // Lanthan currently supports only Firefox
  .spyAddon(path.join(__dirname, 'addon'))  // Spy to the add-on
  .build();
```

The remote WebExtensions API can access the local storage of the add-on:

```javascript
let { count } = await browser.storage.local.get('count');
assert.strictEqual(count['https://example.com'], 1);
assert.strictEqual(count['https://example.org'], 3);
assert.strictEqual(count['https://example.net'], undefined);
```

## Licence

[MIT][LICENCE]

[selenium-webdriver]: https://github.com/SeleniumHQ/selenium
[npm]: https://www.npmjs.com/package/lanthan
[selenium-project-document]: https://www.seleniumhq.org/docs/
[selenium-webdriver-javascript-document]: https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/

[examples]: https://github.com/ueokande/lanthan/blob/master/examples/
[examples/addon]: https://github.com/ueokande/lanthan/blob/master/examples/addon
[01_setup_teardown.js]: https://github.com/ueokande/lanthan/blob/master/examples/01_setup_teardown.js
[02_webext_api.js]: https://github.com/ueokande/lanthan/blob/master/examples/02_webext_api.js
[03_webdriver_api.js]: https://github.com/ueokande/lanthan/blob/master/examples/03_webdriver_api.js
[04_spy_addon.js]: https://github.com/ueokande/lanthan/blob/master/examples/04_spy_addon.js
[LICENCE]: https://github.com/ueokande/lanthan/blob/master/LICENCE

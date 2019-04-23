'use strict';

const lanthan = require('../../../lib');
const Element = require('../../../lib/webdriver/Element');
const assert = require('assert');
const server = require('../server');

describe('Session', () => {
  let http;
  let firefox;

  before(async() => {
    let sv = server.newApp();
    http = sv.listen(10101, '127.0.0.1');

    firefox = await lanthan.firefox();
  });

  beforeEach(async() => {
    await firefox.session.navigateTo('http://127.0.0.1:10101/Session/');
  });

  after(async() => {
    if (firefox) {
      await firefox.close();
    }
    http.close();
  });

  describe('#findElementByCSS', () => {
    it('shoud return an element by css', async() => {
      let elem = await firefox.session.findElementByCSS('body');
      assert(elem instanceof Element);
    });

    it('shoud throw an error if no elements exist', async() => {
      try {
        await firefox.session.findElementByCSS('div');
        assert.fail('unexpected success');
      } catch (e) {
        assert(e.message.includes('404'));
      }
    });
  });

  describe('#findElementsByCSS', () => {
    it('shoud return an element by css', async() => {
      let eles = await firefox.session.findElementsByCSS('p');
      assert(eles.length === 3);
      assert(eles[0] instanceof Element);
      assert(eles[1] instanceof Element);
      assert(eles[2] instanceof Element);
    });

    it('shoud return empty elements if no elements exist', async() => {
      let eles = await firefox.session.findElementsByCSS('div');
      assert(eles.length === 0);
    });
  });

  describe('#executeScript', () => {
    it('should execute script by string', async() => {
      let result = await firefox.session.executeScript('return 1 + 2');
      assert(result === 3);
    });

    it('should execute script by the block', async() => {
      let result = await firefox.session.executeScript(() => 1 + 2);
      assert(result === 3);

      // eslint-disable-next-line no-undef
      result = await firefox.session.executeScript(() => window.location.href);
      assert(result === 'http://127.0.0.1:10101/Session/');
    });
  });
});

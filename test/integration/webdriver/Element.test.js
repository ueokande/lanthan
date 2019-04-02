'use strict';

const lanthan = require('../../../lib');
const assert = require('power-assert');
const server = require('../server');
const Key = lanthan.Key;

describe('Element', () => {
  let http;
  let firefox;

  before(async() => {
    let sv = server.newApp();
    http = sv.listen(10101, '127.0.0.1');

    firefox = await lanthan.firefox();
  });

  beforeEach(async() => {
    await firefox.session.navigateTo('http://127.0.0.1:10101/Element/');
  });

  after(async() => {
    if (firefox) {
      await firefox.close();
    }
    http.close();
  });

  describe('#findElementByCSS', () => {
    it('should find an element by class name', async() => {
      let elem = await firefox.session.findElementByCSS('.alice');
      let text = await elem.getText();
      assert(text === 'alice');
    });

    it('should find an element by id', async() => {
      let elem = await firefox.session.findElementByCSS('#bob');
      let text = await elem.getText();
      assert(text === 'bob');
    });

    it('shoud find an element by name', async() => {
      let elem = await firefox.session.findElementByCSS('[name=carol]');
      let text = await elem.getText();
      assert(text === 'carol');
    });
  });

  describe('#sendKeys', () => {
    it('should send keys to the element', async() => {
      let body = await firefox.session.findElementByCSS('body');
      await body.sendKeys('a');
      await body.sendKeys(Key.Shift, 'a');

      let lis = await firefox.session.findElementsByCSS('li');
      assert(lis.length === 3);

      let text1 = await lis[0].getText();
      let text2 = await lis[1].getText();
      let text3 = await lis[2].getText();
      assert(text1 === 'a');
      assert(text2 === 'Shift');
      assert(text3 === 'A');
    });
  });

  describe('#getStyle', () => {
    it('shoud get styles of the element', async() => {
      let elem = await firefox.session.findElementByCSS('.bold');
      let value = await elem.getStyle('font-weight');
      assert(Number(value) > 0);
    });
  });
});

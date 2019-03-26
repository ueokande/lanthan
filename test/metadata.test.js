const metadata = require('../lib/metadata');
const assert = require('power-assert');

describe('metadata', () => {
  describe('#methods', () => {
    it('should contains "browser.tabs.update"', () => {
      assert(metadata.methods().includes('browser.tabs.update'));
    });
  });

  describe('#minArgs', () => {
    it('should return 1 for "browser.tabs.update"', () => {
      let n = metadata.minArgs('browser.tabs.update');
      assert(n === 1);
    });

    it('should throw RangeError if the method does not exits', () => {
      assert(() => metadata.minArgs('browser.tabs.harakiri'), RangeError);
    });
  });

  describe('#maxArgs', () => {
    it('should return 2 for "browser.tabs.update"', () => {
      let n = metadata.maxArgs('browser.tabs.update');
      assert(n === 2);
    });

    it('should throw RangeError if the method does not exits', () => {
      assert(() => metadata.maxArgs('browser.tabs.harakiri'), RangeError);
    });
  });
});

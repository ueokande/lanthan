const MessageClient = require('../../lib/webext/MessageClient');
const assert = require('power-assert');
const WritableBuffer = require('./WritableBuffer');

describe('MessageClient', () => {
  let buffer;
  let client;

  before(() => {
      buffer = new WritableBuffer();
      client = new MessageClient(buffer);
  })

  describe('#sendMessage()', () => {
    it('should writers messages with a header', () => {
      client.sendMessage({ name: 'alice', age: 12})
      client.sendMessage({ name: 'bob', age: 14})

      let len1 = buffer.data.slice(0, 4).readUInt32LE();
      let data1 = buffer.data.slice(4, 4 + len1);
      let obj1 = JSON.parse(data1);

      assert(obj1.name === 'alice')
      assert(obj1.age === 12)

      let len2 = buffer.data.slice(4 + len1, 4 + len1 + 4).readUInt32LE();
      let data2 = buffer.data.slice(4 + len1 + 4, 4 + len1 + 4 + len2);
      let obj2 = JSON.parse(data2);

      assert(obj2.name === 'bob')
      assert(obj2.age === 14)
    });
  });
});


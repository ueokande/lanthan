const MessageListener = require('../../lib/webext/MessageListener');
const ReadableBuffer = require('./ReadableBuffer');
const assert = require('power-assert');

describe('MessageListener', () => {
  let buffer = new ReadableBuffer();
  let listener = new MessageListener(buffer);

  beforeEach(() => {
    buffer = new ReadableBuffer();
    listener = new MessageListener(buffer);
  });

  describe('#onMessage', () => {
    it('received messages', () => {
      let messages = [];

      listener.onMessage((message) => { messages.push(message); });
      listener.listen();

      let data = Buffer.from(JSON.stringify({ name: 'alice', age: 12 }));
      let lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(data.length, 0);
      buffer.write(lenBytes);
      buffer.write(data);

      data = Buffer.from(JSON.stringify({ name: 'bob', age: 14 }));
      lenBytes.writeUInt32LE(data.length, 0);
      buffer.write(lenBytes);
      buffer.write(data);

      assert(messages.length === 2);
      assert.deepEqual(messages[0], { name: 'alice', age: 12 })
      assert.deepEqual(messages[1], { name: 'bob', age: 14 })
    });
  });

  describe('#onError', () => {
    it('raises SyntaxError', () => {
      let errors = [];

      listener.onMessage((message) => {});
      listener.onError((err) => { errors.push(err) });
      listener.listen();

      let data = Buffer.from('********');
      let lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(data.length, 0);
      buffer.write(lenBytes);
      buffer.write(data);

      assert(errors.length === 1);
      assert(errors[0] instanceof SyntaxError);
    });
  });
});

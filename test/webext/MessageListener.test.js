'use strict';

const MessageListener = require('../../lib/driver/MessageListener');
const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

describe('MessageListener', () => {

  let tmpfile;

  const uint32Bytes = (num) => {
    let bytes = Buffer.alloc(4);
    bytes.writeUInt32LE(num, 0);
    return bytes;
  };

  beforeEach(() => {
    tmpfile = path.join(os.tmpdir(), 'MessageListener-' + uuidv4());
  });

  afterEach(() => {
    fs.unlinkSync(tmpfile);
  });

  describe('#onMessage', () => {
    it('received messages', async() => {
      let data1 = Buffer.from(JSON.stringify({ name: 'alice', age: 12 }));
      let data2 = Buffer.from(JSON.stringify({ name: 'bob', age: 14 }));
      fs.appendFileSync(tmpfile, Buffer.concat([
        uint32Bytes(data1.length), data1,
        uint32Bytes(data2.length), data2,
      ]));

      let messages = [];
      let buffer = fs.createReadStream(tmpfile);
      let listener = new MessageListener(buffer);
      listener.listen();
      await new Promise((resolve) => {
        let count = 0;
        listener.onMessage((message) => {
          messages.push(message);
          count++;
          if (count === 2) {
            resolve();
          }
        });
      });

      assert.equal(messages.length, 2);
      assert.deepEqual(messages[0], { name: 'alice', age: 12 });
      assert.deepEqual(messages[1], { name: 'bob', age: 14 });
    });
  });

  describe('#onError', () => {
    it('raises SyntaxError', async() => {
      let data = Buffer.from('********');
      fs.appendFileSync(tmpfile, Buffer.concat([
        uint32Bytes(data.length), data,
      ]));

      let errors = [];
      let buffer = fs.createReadStream(tmpfile);
      let listener = new MessageListener(buffer);
      listener.listen();
      listener.onMessage(() => {});
      await new Promise((resolve) => {
        listener.onError((err) => {
          errors.push(err);
          resolve();
        });
      });

      assert(errors.length === 1);
      assert(errors[0] instanceof SyntaxError);
    });
  });
});

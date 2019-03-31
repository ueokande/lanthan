'use strict';

const MessageClient = require('../../lib/webext/MessageClient');
const assert = require('power-assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

describe('MessageClient', () => {
  let tmpfile;
  let buffer;
  let client;

  beforeEach(() => {
    tmpfile = path.join(os.tmpdir(), 'MessageClient-' + uuidv4());
    buffer = fs.createWriteStream(tmpfile);
    client = new MessageClient(buffer);
  });

  afterEach(() => {
    fs.unlinkSync(tmpfile);
  });

  describe('#sendMessage()', () => {
    it('should writers messages with a header', async() => {
      client.sendMessage({ name: 'alice', age: 12 });
      client.sendMessage({ name: 'bob', age: 14 });

      buffer.end();

      await new Promise(resolve => buffer.on('close', resolve));

      let raw = fs.readFileSync(tmpfile);
      let len1 = raw.slice(0, 4).readUInt32LE();
      let data1 = raw.slice(4, 4 + len1);
      let obj1 = JSON.parse(data1);

      assert(obj1.name === 'alice');
      assert(obj1.age === 12);

      let len2 = raw.slice(4 + len1, 4 + len1 + 4).readUInt32LE();
      let data2 = raw.slice(4 + len1 + 4, 4 + len1 + 4 + len2);
      let obj2 = JSON.parse(data2);

      assert(obj2.name === 'bob');
      assert(obj2.age === 14);
    });
  });
});


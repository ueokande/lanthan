import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import uuidv4 from 'uuid/v4';

import { MessageClientImpl } from '../../src/driver/MessageClient';

describe('MessageClientImpl', () => {
  let tmpfile: string;
  let buffer: fs.WriteStream;
  let client: MessageClientImpl;

  beforeEach(() => {
    tmpfile = path.join(os.tmpdir(), 'MessageClient-' + uuidv4());
    buffer = fs.createWriteStream(tmpfile);
    client = new MessageClientImpl(buffer);
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
      let len1 = raw.slice(0, 4).readUInt32LE(0);
      let data1 = raw.slice(4, 4 + len1);
      let obj1 = JSON.parse(data1.toString());

      assert.strictEqual(obj1.name, 'alice');
      assert.strictEqual(obj1.age, 12);

      let len2 = raw.slice(4 + len1, 4 + len1 + 4).readUInt32LE(0);
      let data2 = raw.slice(4 + len1 + 4, 4 + len1 + 4 + len2);
      let obj2 = JSON.parse(data2.toString());

      assert.strictEqual(obj2.name, 'bob');
      assert.strictEqual(obj2.age, 14);
    });
  });
});


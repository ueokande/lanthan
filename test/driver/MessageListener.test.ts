import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import uuidv4 from 'uuid/v4';

import { MessageListenerImpl } from '../../src/driver/MessageListener';

describe('MessageListenerImpl', () => {
  let tmpfile: string;

  const uint32Bytes = (num: number) => {
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

      let messages: object[] = [];
      let buffer = fs.createReadStream(tmpfile);
      let listener = new MessageListenerImpl(buffer);
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

      assert.strictEqual(messages.length, 2);
      assert.deepStrictEqual(messages[0], { name: 'alice', age: 12 });
      assert.deepStrictEqual(messages[1], { name: 'bob', age: 14 });
    });
  });

  describe('#onError', () => {
    it('raises SyntaxError', async() => {
      let data = Buffer.from('********');
      fs.appendFileSync(tmpfile, Buffer.concat([
        uint32Bytes(data.length), data,
      ]));

      let errors: Error[] = [];
      let buffer = fs.createReadStream(tmpfile);
      let listener = new MessageListenerImpl(buffer);
      listener.listen();
      listener.onMessage(() => {});
      await new Promise((resolve) => {
        listener.onError((err) => {
          errors.push(err);
          resolve();
        });
      });

      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0] instanceof SyntaxError);
    });
  });
});

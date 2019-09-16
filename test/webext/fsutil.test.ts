import * as fsutil from '../../src/webext/fsutil';
import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('fsutil', () => {
  let tmpdir: string;

  beforeEach(() => {
    tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsutil-'));
  });

  describe('#mkdirAllSync()', () => {
    it('should create directories recursively', () => {
      let p = path.join(tmpdir, 'foo', 'bar');
      fsutil.mkdirAllSync(p, 0x755);

      let stat = fs.lstatSync(p);
      assert.ok(stat.isDirectory());
    });

    it('should not throws an error if directory already exists', () => {
      fsutil.mkdirAllSync(os.tmpdir(), 0x755);
    });
  });
});


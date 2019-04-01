'use strict';

const fsutil = require('../../lib/webext/fsutil');
const assert = require('power-assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('fsutil', () => {
  let tmpdir;
  beforeEach(() => {
    tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsutil-'));
  });

  describe('#mkdirAllSync()', () => {
    it('should create directories recursively', () => {
      let p = path.join(tmpdir, 'foo', 'bar');
      fsutil.mkdirAllSync(p, 0x755);

      let stat = fs.lstatSync(p);
      assert(stat.isDirectory());
    });

    it('should not throws an error if directory already exists', () => {
      fsutil.mkdirAllSync(os.tmpdir(), 0x755);
    });
  });
});


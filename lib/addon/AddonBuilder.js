'use strict';

const fs = require('fs');
const path = require('path');
const Manifest = require('./Manifest');
const JSZip = require('jszip');

class AddonBuilder {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.zip = new JSZip();
  }

  addFile(name, content) {
    if (content) {
      this.zip.file(name, content);
      return;
    }

    let realpath = path.resolve(name);
    let baseDir = path.resolve(this.baseDir);
    if (!realpath.startsWith(baseDir)) {
      throw new Error(`file ${name} is out of directory of the addon`);
    }

    let basename = path.relative(baseDir, realpath);
    let data = fs.readFileSync(realpath);
    this.zip.file(basename, data);
  }

  build() {
    let manifestPath = path.join(this.baseDir, 'manifest.json');
    let manifestData = fs.readFileSync(manifestPath);
    let manifest = new Manifest(JSON.parse(manifestData));

    manifest.dependencies().forEach((r) => {
      let data = fs.readFileSync(path.join(this.baseDir, r));
      this.zip.file(r, data);
    });
    this.zip.file('manifest.json', manifestData);

    return this.zip.generateAsync({
      compression: 'DEFLATE',
      type: 'nodebuffer'
    });
  }
}

module.exports = AddonBuilder;

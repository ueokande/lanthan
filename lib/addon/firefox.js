'use strict';

const fs = require('fs');
const path = require('path');
const Manifest = require('./Manifest');
const JSZip = require('jszip');

class AddonBuilder {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  build() {
    let manifestPath = path.join(this.baseDir, 'manifest.json');
    let manifestData = fs.readFileSync(manifestPath);
    let manifest = new Manifest(JSON.parse(manifestData));

    let zip = new JSZip();
    manifest.dependencies().forEach((r) => {
      let data = fs.readFileSync(path.join(this.baseDir, r));
      zip.file(r, data);
    });
    zip.file('manifest.json', manifestData);

    return zip.generateAsync({
      compression: 'DEFLATE',
      type: 'nodebuffer'
    });
  }
}

module.exports = AddonBuilder;

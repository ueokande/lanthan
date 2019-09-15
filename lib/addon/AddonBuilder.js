'use strict';

const fs = require('fs');
const path = require('path');

const ManifestBuilder = require('./ManifestBuilder');
const JSZip = require('jszip');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      return walk(dirPath, callback);
    }
    callback(path.join(dir, f));
  });
};

class AddonBuilder {
  constructor(baseDir) {
    this.manifestBuilder = ManifestBuilder.fromPath(path.join(baseDir, 'manifest.json'));
    this.baseDir = baseDir;
    this.zip = new JSZip();
  }

  addFile(name, content) {
    if (content) {
      this.zip.file(name, content);
      return this;
    }

    let realpath = path.resolve(name);
    let baseDir = path.resolve(this.baseDir);
    if (!realpath.startsWith(baseDir)) {
      throw new Error(`file ${name} is out of directory of the addon`);
    }

    let basename = path.relative(baseDir, realpath);
    let data = fs.readFileSync(realpath);
    this.zip.file(basename, data);

    return this;
  }

  addBackgroundScript(name, content) {
    this.manifestBuilder.addBackgroundScript(name);
    this.addFile(name, content);
    return this;
  }

  addPermission(permission) {
    this.manifestBuilder.addPermission(permission);
    return this;
  }

  setBrowserSpecificSettings(browser, key, value) {
    this.manifestBuilder.setBrowserSpecificSettings(browser, key, value);
    return this;
  }

  build() {
    walk(this.baseDir, (f) => {
      let data = fs.readFileSync(f);
      this.zip.file(path.relative(this.baseDir, f), data);
    });
    this.zip.file('manifest.json', this.manifestBuilder.buildString());

    return this.zip.generateAsync({
      compression: 'DEFLATE',
      type: 'nodebuffer'
    });
  }
}

module.exports = AddonBuilder;

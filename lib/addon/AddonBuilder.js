'use strict';

const fs = require('fs');
const path = require('path');
const Manifest = require('./Manifest');
const JSZip = require('jszip');

class AddonBuilder {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.addionalBackground = [];
    this.additionalPermission = [];
    this.overrides = {};
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
    this.addionalBackground.push(name);
    this.addFile(name, content);

    return this;
  }

  addPermission(permission) {
    this.additionalPermission.push(permission);

    return this;
  }

  overrideProperty(name, value) {
    this.overrides[name] = value;

    return this;
  }

  build() {
    let manifestPath = path.join(this.baseDir, 'manifest.json');
    let manifestData = JSON.parse(fs.readFileSync(manifestPath));
    let manifest = new Manifest(manifestData);

    manifest.dependencies().forEach((r) => {
      let data = fs.readFileSync(path.join(this.baseDir, r));
      this.zip.file(r, data);
    });

    manifestData.background = manifestData.background || {};
    manifestData.background.scripts = this.addionalBackground.concat(manifestData.background.scripts || []);
    manifestData.permissions = this.additionalPermission.concat(manifestData.permissions || []);
    for (let key of Object.keys(this.overrides)) {
      manifestData[key] = this.overrides[key];
    }
    this.zip.file('manifest.json', JSON.stringify(manifestData, 2));

    return this.zip.generateAsync({
      compression: 'DEFLATE',
      type: 'nodebuffer'
    });
  }
}

module.exports = AddonBuilder;

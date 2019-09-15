'use strict';

const fs = require('fs');

class ManifestBuilder {
  constructor(data = {}) {
    this.data = data;
  }

  static fromPath(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new ManifestBuilder(data);
  }

  addBackgroundScript(path) {
    this.data.background = this.data.background || {};
    this.data.background.scripts = this.data.background.scripts || [];
    this.data.background.scripts.push(path);
    return this;
  }

  addPermission(permission) {
    this.data.permissions = this.data.permissions || [];
    this.data.permissions.push(permission);
    return this;
  }

  setBrowserSpecificSettings(browser, key, value) {
    this.data.applications = this.data.applications || {};
    this.data.applications[browser] = Object.assign({},
      this.data.applications[browser],
      { [key]: value });
    return this;
  }

  build() {
    return this.data;
  }

  buildString() {
    return JSON.stringify(this.data, 2);
  }
}

module.exports = ManifestBuilder;

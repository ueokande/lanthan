'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const addonManifest = require('../../addon/manifest');
const fsutil = require('./fsutil');

// ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Manifest_location
const createManifestPlatforms = {
  linux: (name, body) => {
    let dir = path.join(os.homedir(), '.mozilla', 'native-messaging-hosts');
    fsutil.mkdirAllSync(dir);
    let fullpath = path.join(dir, `${name}.json`);
    fs.writeFileSync(fullpath, JSON.stringify(body));
  },

  darwin: (name, body) => {
    let dir = path.join(os.homedir(), 'Library', 'Application Support', 'Mozilla', 'NativeMessagingHosts');
    fsutil.mkdirAllSync(dir);
    let fullpath = path.join(dir, `${name}.json`);
    fs.writeFileSync(fullpath, JSON.stringify(body));
  },
};

const removeManiefstPlatforms = {
  linux: (name) => {
    let fullpath = path.join(os.homedir(), '.mozilla', 'native-messaging-hosts', `${name}.json`);
    fs.unlinkSync(fullpath);
  },

  darwin: (name) => {
    let fullpath = path.join(os.homedir(),
      'Library', 'Application Support', 'Mozilla',
      'NativeMessagingHosts', `${name}.json`);
    fs.unlinkSync(fullpath);
  },
};

const NAME = 'lanthan_driver';
const MANIFEST_BODY = {
  'name': NAME,
  'description': NAME,
  'path': path.join(__dirname, '..', '..', 'bin', 'lanthan-driver.js'),
  'type': 'stdio',
  'allowed_extensions': [addonManifest.applications.gecko.id],
};

const createManifest = () => {
  let platform = process.platform;
  switch (platform) {
  case 'linux':
  case 'darwin':
    createManifestPlatforms[platform](NAME, MANIFEST_BODY);
    return;
  }
  throw new Error('Unsupported platform: ' + process.platform);
};

const removeManifest = () => {
  let platform = process.platform;
  switch (platform) {
  case 'linux':
  case 'darwin':
    removeManiefstPlatforms[platform](NAME);
    return;
  }
  throw new Error('Unsupported platform: ' + process.platform);
};

module.exports = {
  createManifest,
  removeManifest,
};

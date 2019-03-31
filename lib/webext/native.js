'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const addonManifest = require('../../addon/manifest');

const NAME = 'lanthan_driver';
const manifestBody = {
  'name': NAME,
  'description': NAME,
  'path': path.join(__dirname, '..', '..', 'bin', 'lanthan-driver.js'),
  'type': 'stdio',
  'allowed_extensions': [addonManifest.applications.gecko.id],
};

const createManifestLinux = () => {
  let dir = path.join(os.homedir(), '.mozilla', 'native-messaging-hosts');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  }
  let fullpath = path.join(dir, `${NAME}.json`);
  fs.writeFileSync(fullpath, JSON.stringify(manifestBody));
};

const removeManifestLinux = () => {
  let fullpath = path.join(os.homedir(),
    '.mozilla', 'native-messaging-hosts', `${NAME}.json`);
  fs.unlinkSync(fullpath);
};

const createManifest = () => {
  switch (process.platform) {
  case 'linux':
    createManifestLinux();
    return;
  }
  throw new Error('Unsupported platform: ' + process.platform);
};

const removeManifest = () => {
  switch (process.platform) {
  case 'linux':
    removeManifestLinux();
    return;
  }
  throw new Error('Unsupported platform: ' + process.platform);
};

module.exports = {
  createManifest,
  removeManifest,
};

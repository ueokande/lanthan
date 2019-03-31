const fs = require('fs');
const os = require('os');
const path = require('path');
const addonManifest = require('../../addon/manifest');

const NAME = 'webext-driver';
const manifestBody = {
  name: NAME,
  path: path.join(__dirname, '..', '..', 'cli.js'),
  type: 'stdio',
  allowed_extensions: [addonManifest.applications.gecko.id],
}

const createManifestLinux = () => {
  let fullpath = path.join(os.homedir(),
    '.mozilla', 'native-messaging-hosts', `${NAME}.json`);
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

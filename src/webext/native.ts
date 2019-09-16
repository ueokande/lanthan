import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as fsutil from './fsutil';

const getAddonManifestGeckoID = () => {
  let p = path.join(__dirname, '..', '..', 'addon', 'manifest.json')
  let data = fs.readFileSync(p, 'utf8');
  let manifest = JSON.parse(data);
  return manifest.applications.gecko.id;
};

// ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Manifest_location
const createManifestPlatforms = {
  linux: (name: string, body: object) => {
    let dir = path.join(os.homedir(), '.mozilla', 'native-messaging-hosts');
    fsutil.mkdirAllSync(dir);
    let fullpath = path.join(dir, `${name}.json`);
    fs.writeFileSync(fullpath, JSON.stringify(body));
  },

  darwin: (name: string, body: object) => {
    let dir = path.join(os.homedir(), 'Library', 'Application Support', 'Mozilla', 'NativeMessagingHosts');
    fsutil.mkdirAllSync(dir);
    let fullpath = path.join(dir, `${name}.json`);
    fs.writeFileSync(fullpath, JSON.stringify(body));
  },
};

const removeManiefstPlatforms = {
  linux: (name: string) => {
    let fullpath = path.join(os.homedir(), '.mozilla', 'native-messaging-hosts', `${name}.json`);
    fs.unlinkSync(fullpath);
  },

  darwin: (name: string) => {
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
  'allowed_extensions': [getAddonManifestGeckoID()],
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

export {
  createManifest,
  removeManifest,
};

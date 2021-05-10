import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

import ManifestBuilder from './ManifestBuilder';

const walk = (dir: string, callback: (p: string) => void): void => {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f === 'node_modules' || f === '.git') {
        return
      }
      return walk(dirPath, callback);
    }
    callback(path.join(dir, f));
  });
};

export default class AddonBuilder {
  private manifestBuilder: ManifestBuilder;

  private zip: JSZip;

  constructor(private baseDir: string) {
    this.manifestBuilder = ManifestBuilder.fromPath(path.join(baseDir, 'manifest.json'));
    this.zip = new JSZip();
  }

  addFile(name: string, content: string | Buffer): AddonBuilder {
    if (content) {
      this.zip.file(name, content);
      return this;
    }

    const realpath = path.resolve(name);
    const baseDir = path.resolve(this.baseDir);
    if (!realpath.startsWith(baseDir)) {
      throw new Error(`file ${name} is out of directory of the addon`);
    }

    const basename = path.relative(baseDir, realpath);
    const data = fs.readFileSync(realpath);
    this.zip.file(basename, data);

    return this;
  }

  addBackgroundScript(name: string, content: string | Buffer): AddonBuilder {
    this.manifestBuilder.addBackgroundScript(name);
    this.addFile(name, content);
    return this;
  }

  addPermission(permission: string): AddonBuilder {
    this.manifestBuilder.addPermission(permission);
    return this;
  }

  setBrowserSpecificSettings(browser: string, key: string, value: string): AddonBuilder {
    this.manifestBuilder.setBrowserSpecificSettings(browser, key, value);
    return this;
  }

  build(): Promise<Buffer> {
    walk(this.baseDir, (f) => {
      const data = fs.readFileSync(f);
      this.zip.file(path.relative(this.baseDir, f), data);
    });
    this.zip.file('manifest.json', this.manifestBuilder.buildString());

    return this.zip.generateAsync({
      compression: 'DEFLATE',
      type: 'nodebuffer'
    });
  }
}

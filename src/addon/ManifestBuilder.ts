import * as fs from 'fs';

export default class ManifestBuilder {
  constructor(
    private data: any = {},
  ) {
  }

  static fromPath(path: string): ManifestBuilder {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    return new ManifestBuilder(data);
  }

  addBackgroundScript(path: string): ManifestBuilder {
    this.data.background = this.data.background || {};
    this.data.background.scripts = this.data.background.scripts || [];
    this.data.background.scripts.push(path);
    return this;
  }

  addPermission(permission: string): ManifestBuilder {
    this.data.permissions = this.data.permissions || [];
    this.data.permissions.push(permission);
    return this;
  }

  setBrowserSpecificSettings(browser: string, key: string, value: string | number | boolean): ManifestBuilder {
    this.data.applications = this.data.applications || {};
    this.data.applications[browser] = Object.assign({},
      this.data.applications[browser],
      { [key]: value });
    return this;
  }

  build(): any {
    return this.data;
  }

  buildString(): string {
    return JSON.stringify(this.data);
  }
}

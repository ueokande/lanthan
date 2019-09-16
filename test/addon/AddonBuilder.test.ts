import JSZip from 'jszip';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import AddonBuilder from '../../src/addon/AddonBuilder';

describe('AddonBuilder', () => {
  describe('#build', () => {
    it('should returns built driver', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let manifest = JSON.parse(await zip.file('manifest.json').async('text'));
      assert.strictEqual(manifest.name, 'lanthan-driver');

      let background = await zip.file('background.js').async('text');
      let additional = await zip.file('additional.js').async('text');
      assert.strictEqual(background, '/* this is a background script */\n');
      assert.strictEqual(additional, '/* this is an additional file */\n');
    });
  });

  describe('#addBackgroundScript', () => {
    it('should adds background script', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let name = path.join(__dirname, 'out-of-testdata.js');
      builder.addBackgroundScript('out-of-testdata.js', fs.readFileSync(name));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let added = await zip.file('out-of-testdata.js').async('text');
      assert.strictEqual(added, '/* out of testdata */\n');

      let manifest = JSON.parse(await zip.file('manifest.json').async('text'));
      assert.deepStrictEqual(manifest.background.scripts.sort(),
        ['out-of-testdata.js', 'background.js'].sort());
    });
  });

  describe('#addPermission', () => {
    it('should add permission to the manifest', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      builder.addPermission('dns');
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let manifest = JSON.parse(await zip.file('manifest.json').async('text'));
      assert.ok(manifest.permissions.includes('dns'));
    });
  });

  describe('#setBrowserSpecificSettings', () => {
    it('should override a browser specific settings', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      builder.setBrowserSpecificSettings('gecko', 'id', 'foobar@example.com');

      let zip = await JSZip.loadAsync(await builder.build());
      let manifest = JSON.parse(await zip.file('manifest.json').async('text'));
      assert.deepStrictEqual(manifest.applications.gecko.id, 'foobar@example.com');
    });
  });
});

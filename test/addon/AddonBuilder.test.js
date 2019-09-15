'use strict';

const JSZip = require('jszip');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AddonBuilder = require('../../lib/addon/AddonBuilder');

describe('AddonBuilder', () => {
  describe('#build', () => {
    it('should returns built driver', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
      assert.strictEqual(manifest.name, 'lanthan-driver');

      let background = await zip.file('background.js').async('string');
      let additional = await zip.file('additional.js').async('string');
      assert.strictEqual(background, '/* this is a background script */\n');
      assert.strictEqual(additional, '/* this is an additional file */\n');
    });
  });

  describe('#addBackgroundScript', () => {
    it('should adds background script', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let name = path.join(__dirname, 'AddonBuilder.test.js');
      builder.addBackgroundScript('AddonBuilder.test.js', fs.readFileSync(name));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let added = await zip.file('AddonBuilder.test.js').async('string');
      assert(added.startsWith(`'use strict';`));

      let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
      assert.deepStrictEqual(manifest.background.scripts.sort(),
        ['background.js', 'AddonBuilder.test.js'].sort());
    });
  });

  describe('#addPermission', () => {
    it('should add permission to the manifest', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      builder.addPermission('dns');
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
      assert(manifest.permissions.includes('dns'));
    });
  });

  describe('#setBrowserSpecificSettings', () => {
    it('should override a browser specific settings', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      builder.setBrowserSpecificSettings('gecko', 'id', 'foobar@example.com');

      let zip = await JSZip.loadAsync(await builder.build());
      let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
      assert.deepStrictEqual(manifest.applications.gecko.id, 'foobar@example.com');
    });
  });
});

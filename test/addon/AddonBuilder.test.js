'use strict';

const JSZip = require('jszip');
const assert = require('power-assert');
const fs = require('fs');
const path = require('path');
const AddonBuilder = require('../../lib/addon/AddonBuilder');

describe('AddonBuilder', () => {
  describe('#build', () => {
    it('should returns built addon', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
      assert.equal(manifest.name, 'lanthan-driver');

      let background = await zip.file('background.js').async('string');
      assert.equal(background, `/* this is a background script */
`);

      assert.equal(zip.file('additional.js'), null);
    });
  });

  describe('#addFile', () => {
    it('should add file with its content', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      let name = path.join(__dirname, 'AddonBuilder.test.js');
      builder.addFile('AddonBuilder.test.js', fs.readFileSync(name));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let added = await zip.file('AddonBuilder.test.js').async('string');
      assert(added.startsWith(`'use strict';`));
    });

    it('should add file with path within addon directory', async() => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      builder.addFile(path.join(__dirname, 'testdata', 'additional.js'));
      let data = await builder.build();

      let zip = await JSZip.loadAsync(data);
      let added = await zip.file('additional.js').async('string');
      assert.equal(added, `/* this is an additional file */
`);
    });

    it('should add file with content', () => {
      let builder = new AddonBuilder(path.join(__dirname, 'testdata'));
      assert.throws(() => {
        builder.addFile(path.join(__dirname, 'AddonBuilder.test.js'));
      });
    });
  });
});

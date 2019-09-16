import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as assert from 'assert';

import ManifestBuilder from '../../src/addon/ManifestBuilder';

describe('ManifestBuilder', () => {
  describe('#fromPath', () => {
    let manifestPath: string | undefined;

    afterEach(() => {
      if (manifestPath) {
        fs.unlinkSync(manifestPath);
      }
    });

    it('reads manifest from a path', () => {
      manifestPath = path.join(os.tmpdir(), 'manifest.json');
      fs.writeFileSync(manifestPath, `{
  "manifest_version": 2,
  "name": "Lanthan Driver",
  "version": "0.0.1"
}`);
      let manifest = ManifestBuilder.fromPath(manifestPath).build();
      assert.strictEqual(manifest.name, 'Lanthan Driver');
      assert.strictEqual(manifest.version, '0.0.1');
    });
  });

  describe('#addBackgroundScript', () => {
    it('adds a background scripts with its field', () => {
      let manifest = new ManifestBuilder({})
        .addBackgroundScript('alice.js')
        .addBackgroundScript('bob.js')
        .build();
      assert.deepStrictEqual(manifest.background, {
        scripts: ['alice.js', 'bob.js'],
      });
    });

    it('adds a background scripts into current fields', () => {
      let manifest = new ManifestBuilder({
        background: {
          scripts: ['carol.js'],
        },
      })
        .addBackgroundScript('alice.js')
        .addBackgroundScript('bob.js')
        .build();
      assert.deepStrictEqual(manifest.background, {
        scripts: ['carol.js', 'alice.js', 'bob.js'],
      });
    });
  });

  describe('#addPermission', () => {
    it('adds a permission with its field', () => {
      let manifest = new ManifestBuilder({})
        .addPermission('nativeMessaging')
        .build();
      assert.deepStrictEqual(
        manifest.permissions,
        ['nativeMessaging']);
    });

    it('adds a permission into current fields', () => {
      let manifest = new ManifestBuilder({
        permissions: ['tabs'],
      })
        .addPermission('nativeMessaging')
        .build();
      assert.deepStrictEqual(
        manifest.permissions,
        ['tabs', 'nativeMessaging']);
    });
  });

  describe('#setBrowserSpecificSettings', () => {
    it('adds a browser specific settings with its field', () => {
      let manifest = new ManifestBuilder({})
        .setBrowserSpecificSettings('gecko', 'id', 'lanthan-driver@i-beam.org')
        .build();
      assert.deepStrictEqual(
        manifest.applications,
        { gecko: { id: 'lanthan-driver@i-beam.org' }},
      );
    });

    it('adds a permission scripts into current fields', () => {
      let manifest = new ManifestBuilder({
        applications: {
          gecko: {
            'id': 'lanthan-driver@i-beam.org',
          },
        },
      })
        .setBrowserSpecificSettings('gecko', 'id', 'overridden@i-beam.org')
        .setBrowserSpecificSettings('edge', 'browser_action_next_to_addressbar', true)
        .build();

      assert.deepStrictEqual(
        manifest.applications,
        {
          gecko: { id: 'overridden@i-beam.org' },
          edge: { 'browser_action_next_to_addressbar': true },
        },
      );
    });
  });
});

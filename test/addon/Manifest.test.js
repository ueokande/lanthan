'use strict';

const assert = require('assert');
const Manifest = require('../../lib/addon/Manifest');

const fullManifest = {
  'name': 'my-addon',
  'description': 'this is my addon',
  'version': '0.1',

  'browser_specific_settings': {
    'gecko': {
      'id': 'addon@example.com',
      'strict_min_version': '42.0'
    }
  },

  'background': {
    'scripts': ['jquery.js', 'my-background.js'],
    'page': 'my-background.html'
  },

  'content_security_policy': `script-src 'self' https://example.com; object-src 'self'`,

  'content_scripts': [
    {
      'exclude_matches': ['*://developer.mozilla.org/*'],
      'matches': ['*://*.mozilla.org/*'],
      'js': ['content1.js', 'content2.js']
    }, {
      'exclude_matches': ['https://google.com/*'],
      'js': ['googler.js']
    }
  ],

  'default_locale': 'en',

  'icons': {
    '48': 'icon.png',
    '96': 'icon@2x.png'
  },

  'browser_action': {
    'default_icon': {
      '19': 'button/geo-19.png',
      '38': 'button/geo-38.png'
    },
    'default_title': 'Whereami?',
    'default_popup': 'popup/geo.html'
  },

  'commands': {
    'toggle-feature': {
      'suggested_key': {
        'default': 'Ctrl+Shift+Y',
        'linux': 'Ctrl+Shift+U'
      },
      'description': `Send a 'toggle-feature' event`
    }
  },

  'page_action': {
    'default_icon': {
      '19': 'button/geo-19.png',
      '38': 'button/geo-38.png'
    },
    'default_title': 'Whereami?',
    'default_popup': 'popup/geo.html'
  },

  'options_ui': {
    'page': 'settings.html'
  },

  'permissions': ['webNavigation'],

  'web_accessible_resources': ['images/my-image.png']
};

const emptyManifest = {
};

describe('Manifest', () => {
  describe('#backgroundScripts', () => {
    it('should return background script paths', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.backgroundScripts(), ['jquery.js', 'my-background.js']);
    });

    it('should return empty if background field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.backgroundScripts().length, 0);
    });
  });

  describe('#contentScripts', () => {
    it('should return content script paths', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.contentScripts(), ['content1.js', 'content2.js', 'googler.js']);
    });

    it('should return empty if content_scripts field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.contentScripts().length, 0);
    });
  });

  describe('#icons', () => {
    it('should return icon paths', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.icons(), ['icon.png', 'icon@2x.png']);
    });

    it('should return empty if icons field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.icons().length, 0);
    });
  });

  describe('#browserActionIcons', () => {
    it('should return icon paths on browser actions', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.browserActionIcons(), ['button/geo-19.png', 'button/geo-38.png']);
    });

    it('should return empty if browser_action field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.browserActionIcons().length, 0);
    });
  });

  describe('#browserActionPopup', () => {
    it('should return a popup path on browser actions', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.browserActionPopup(), 'popup/geo.html');
    });

    it('should return null if browser_action field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.browserActionPopup(), null);
    });
  });

  describe('#pageActionIcons', () => {
    it('should return icon paths on page actions', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.pageActionIcons(), ['button/geo-19.png', 'button/geo-38.png']);
    });

    it('should return empty if page_action field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.pageActionIcons().length, 0);
    });
  });

  describe('#pageActionPopup', () => {
    it('should return a popup path on page actions', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.pageActionPopup(), 'popup/geo.html');
    });

    it('should return null if page_action field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.pageActionPopup(), null);
    });
  });

  describe('#webAccessibleResources', () => {
    it('should return paths of the Web Accessible Resources', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.webAccessibleResources(), ['images/my-image.png']);
    });

    it('should return empty if web_accessible_resources field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.webAccessibleResources().length, 0);
    });
  });

  describe('#optionsUiPage', () => {
    it('should return a path of the options page', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.optionsUiPage(), 'settings.html');
    });

    it('should return empty if options_ui field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.optionsUiPage(), null);
    });
  });

  describe('#dependencies', () => {
    it('should return all dependency paths', () => {
      let manifest = new Manifest(fullManifest);
      assert.deepEqual(manifest.dependencies(), [
        'jquery.js', 'my-background.js',
        'content1.js', 'content2.js', 'googler.js',
        'icon.png', 'icon@2x.png',
        'button/geo-19.png', 'button/geo-38.png',
        'popup/geo.html',
        'images/my-image.png',
        'settings.html',
      ]);
    });

    it('should return empty if web_accessible_resources field not present', () => {
      let manifest = new Manifest(emptyManifest);
      assert.equal(manifest.webAccessibleResources().length, 0);
    });
  });
});

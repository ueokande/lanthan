'use strict';

const assert = require('power-assert');
const Manifest = require('../../lib/addon/Manifest');

const testdata = {
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

  'permissions': ['webNavigation'],

  'web_accessible_resources': ['images/my-image.png']
};

describe('Manifest', () => {
  it('should returns background scripts', () => {
    let manifest = new Manifest(testdata);

    assert.deepEqual(manifest.backgroundScripts(), ['jquery.js', 'my-background.js']);
    assert.deepEqual(manifest.contentScripts(), ['content1.js', 'content2.js', 'googler.js']);
    assert.deepEqual(manifest.icons(), ['icon.png', 'icon@2x.png']);
    assert.deepEqual(manifest.browserActionIcons(), ['button/geo-19.png', 'button/geo-38.png']);
    assert.deepEqual(manifest.browserActionPopup(), 'popup/geo.html');
    assert.deepEqual(manifest.pageActionIcons(), ['button/geo-19.png', 'button/geo-38.png']);
    assert.deepEqual(manifest.pageActionPopup(), 'popup/geo.html');
    assert.deepEqual(manifest.webAccessibleResources(), ['images/my-image.png']);

    let resources = [
      'jquery.js', 'my-background.js',
      'content1.js', 'content2.js', 'googler.js',
      'icon.png', 'icon@2x.png',
      'button/geo-19.png', 'button/geo-38.png',
      'popup/geo.html',
      'images/my-image.png',
    ];
    assert.deepEqual(manifest.dependencies(), resources);
  });
});

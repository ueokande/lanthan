'use strict';

class Manifest {
  constructor(data) {
    this.manifest = data;
  }

  backgroundScripts() {
    if (!('background' in this.manifest) || !('scripts' in this.manifest.background)) {
      return [];
    }
    return this.manifest.background.scripts;
  }

  contentScripts() {
    if (!('content_scripts' in this.manifest)) {
      return [];
    }
    return this.manifest.content_scripts.map(cs => cs.js).reduce((a1, a2) => a1.concat(a2));
  }

  icons() {
    if (!('icons' in this.manifest)) {
      return [];
    }
    return Object.values(this.manifest.icons);
  }

  browserActionIcons() {
    if (!('browser_action' in this.manifest) || !('default_icon' in this.manifest.browser_action)) {
      return [];
    }
    return Object.values(this.manifest.browser_action.default_icon);
  }

  browserActionPopup() {
    if (!('browser_action' in this.manifest) || !('default_popup' in this.manifest.browser_action)) {
      return null;
    }
    return this.manifest.browser_action.default_popup;
  }

  pageActionIcons() {
    if (!('page_action' in this.manifest) || !('default_icon' in this.manifest.page_action)) {
      return [];
    }
    return Object.values(this.manifest.page_action.default_icon);
  }

  pageActionPopup() {
    if (!('page_action' in this.manifest) || !('default_popup' in this.manifest.page_action)) {
      return null;
    }
    return this.manifest.page_action.default_popup;
  }

  webAccessibleResources() {
    if (!('web_accessible_resources' in this.manifest)) {
      return [];
    }
    return this.manifest.web_accessible_resources;
  }

  dependencies() {
    let set = new Set();
    this.backgroundScripts().forEach(f => set.add(f));
    this.contentScripts().forEach(f => set.add(f));
    this.icons().forEach(f => set.add(f));
    this.browserActionIcons().forEach(f => set.add(f));
    set.add(this.browserActionPopup());
    this.pageActionIcons().forEach(f => set.add(f));
    set.add(this.pageActionPopup());
    this.webAccessibleResources().forEach(f => set.add(f));
    set.delete(null);
    return Array.from(set);
  }
}

module.exports = Manifest;

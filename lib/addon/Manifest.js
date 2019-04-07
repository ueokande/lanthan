'use strict';

class Manifest {
  constructor(data) {
    this.manifest = data;
  }

  backgroundScripts() {
    return this.manifest.background.scripts;
  }

  contentScripts() {
    return this.manifest.content_scripts.map(cs => cs.js).reduce((a1, a2) => a1.concat(a2));
  }

  icons() {
    return Object.values(this.manifest.icons);
  }

  browserActionIcons() {
    return Object.values(this.manifest.browser_action.default_icon);
  }

  browserActionPopup() {
    return this.manifest.browser_action.default_popup;
  }

  pageActionIcons() {
    return Object.values(this.manifest.page_action.default_icon);
  }

  pageActionPopup() {
    return this.manifest.page_action.default_popup;
  }

  webAccessibleResources() {
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
    return Array.from(set);
  }
}

module.exports = Manifest;

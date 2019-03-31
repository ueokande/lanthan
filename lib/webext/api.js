'use strict';

const metadata = require('./metadata');
const request = require('request-promise-native');

const create = (address, port) => {
  let root = {};
  let methods = metadata.methods();
  for (let method of methods) {
    let head = root;
    let names = method.split('.');
    for (let name of names.slice(0, -1)) {
      head[name] = head[name] || {};
      head = head[name];
    }
    head[names[names.length - 1]] = (...args) => {
      return request({
        url: `http://${address}:${port}/${method}`,
        method: 'PUT',
        json: args
      });
    };
  }
  return root.browser;
};

module.exports = {
  create,
};

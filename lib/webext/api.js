'use strict';

const metadata = require('./metadata');
const request = require('request-promise-native');
const errors = require('request-promise-native/errors');

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
    head[names[names.length - 1]] = async(...args) => {
      try {
        let response = await request({
          url: `http://${address}:${port}/${method}`,
          method: 'PUT',
          json: args,
        });
        // unwrap due tu result is wrapped as an Array to return a Number
        return response[0];
      } catch (err) {
        if (err instanceof errors.StatusCodeError) {
          let { statusCode } = err;
          let body = err.response.body;
          if (statusCode === 520 && 'message' in body) {
            throw new Error(body.message);
          }
        }
        throw new Error(`${err.statusCode}: ${JSON.stringify(err.body)}`);
      }
    };
  }
  return root.browser;
};

module.exports = {
  create,
};

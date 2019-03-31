'use strict';

const fs = require('fs');

const defaultOption = {
  address: '127.0.0.1',
  port: 18000,
  logFile: '/dev/null',
};

const saveTo = (path, opts = {}) => {
  let settings = Object.assign({}, defaultOption, opts);
  fs.writeFileSync(path, JSON.stringify(settings));
  return settings;
};

const loadFrom = (path) => {
  let buf = fs.readFileSync(path);
  let opts = JSON.parse(buf);
  return Object.assign({}, defaultOption, opts);
};

module.exports = {
  saveTo,
  loadFrom,
};

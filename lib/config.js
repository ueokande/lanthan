'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const defaultPath = path.join(os.tmpdir(), 'lanthan-driver.json');

const defaultOption = {
  address: '127.0.0.1',
  port: 18000,
  logFile: '/dev/null',
};

const save = (
  opts = {},
  filepath = defaultPath,
) => {
  let settings = Object.assign({}, defaultOption, opts);
  fs.writeFileSync(filepath, JSON.stringify(settings));
  return settings;
};

const load = (
  filepath = defaultPath,
) => {
  let buf = fs.readFileSync(filepath);
  let opts = JSON.parse(buf);
  return Object.assign({}, defaultOption, opts);
};

const remove = (
  filepath = defaultPath
) => {
  fs.unlinkSync(filepath);
};

module.exports = {
  save,
  load,
  remove,
};

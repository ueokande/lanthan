'use strict';

const fs = require('fs');
const path = require('path');

const mkdirAllSync = (p, mode = 0o0755) => {
  let dirname = path.dirname(p);
  if (!fs.existsSync(dirname)) {
    mkdirAllSync(dirname, mode);
  }
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
};

module.exports = {
  mkdirAllSync,
};

const fs = require('fs');

const defaultOption = {
  address: '127.0.0.1',
  port: 18000,
  logFile: '/dev/null',
}

const saveTo = (path, opts = {}) => {
  let data = JSON.stringify({ ...defaultOption, ...opts });
}

const loadFrom = (path) => {
  let buf = fs.readFileSync(path);
  let opts = JSON.parse(buf);
  return { ...defaultOption, ...opts };
};

module.exports = {
  saveTo,
  loadFrom,
};

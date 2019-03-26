const apis = require('./api-metadata.json');

let methodList = [];
let minArgsMap = {};
let maxArgsMap = {};

const methods = () => {
  return [...methodList];
};

const minArgs = (method) => {
  if (method in minArgsMap) {
    return minArgsMap[method];
  }
  throw new RangeError(`no minArgs for ${method}`)
};

const maxArgs = (method) => {
  if (method in maxArgsMap) {
    return maxArgsMap[method];
  }
  throw new RangeError(`no maxArgs for ${method}`)
};


const parse = (child, path) => {
  for (let key of Object.keys(child)) {
    let value = child[key];
    if (typeof value !== 'object') {
      throw new SyntaxError('invalid api-metadata.json');
    }
    let path2 = path + '.' + key
    if ('minArgs' in value && 'maxArgs' in value) {
      methodList.push(path2);
      minArgsMap[path2] = value['minArgs'];
      maxArgsMap[path2] = value['maxArgs'];
    } else {
      parse(value, path2);
    }
  }
};

parse(apis, 'browser');

module.exports = {
  methods,
  minArgs,
  maxArgs,
};

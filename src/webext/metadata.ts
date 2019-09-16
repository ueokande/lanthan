import apis from './api-metadata.json';

let methodList: string[] = [];
let minArgsMap: { [method: string]: number } = {};
let maxArgsMap: { [method: string]: number } = {};

const methods = (): string[] => {
  return [...methodList];
};

const minArgs = (method: string): number => {
  if (method in minArgsMap) {
    return minArgsMap[method];
  }
  throw new RangeError(`no minArgs for ${method}`);
};

const maxArgs = (method: string): number => {
  if (method in maxArgsMap) {
    return maxArgsMap[method];
  }
  throw new RangeError(`no maxArgs for ${method}`);
};

const parse = (child: any, path: string): void => {
  for (let key of Object.keys(child)) {
    let value = child[key];
    if (typeof value !== 'object') {
      throw new SyntaxError('invalid api-metadata.json');
    }
    let path2 = path + '.' + key;
    if ('minArgs' in value && 'maxArgs' in value) {
      methodList.push(path2);
      minArgsMap[path2] = value.minArgs;
      maxArgsMap[path2] = value.maxArgs;
    } else {
      parse(value, path2);
    }
  }
};

parse(apis, 'browser');

export {
  methods,
  minArgs,
  maxArgs,
};

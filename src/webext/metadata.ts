import apis from './api-metadata.json';

const methodList: string[] = [];
const minArgsMap: { [method: string]: number } = {};
const maxArgsMap: { [method: string]: number } = {};

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
  for (const key of Object.keys(child)) {
    const value = child[key];
    if (typeof value !== 'object') {
      throw new SyntaxError('invalid api-metadata.json');
    }
    const path2 = path + '.' + key;
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

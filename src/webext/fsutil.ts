import * as fs from 'fs';
import * as path from 'path';

const mkdirAllSync = (p: string, mode = 0o0755): void => {
  let dirname = path.dirname(p);
  if (!fs.existsSync(dirname)) {
    mkdirAllSync(dirname, mode);
  }
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
};

export {
  mkdirAllSync,
};

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const defaultPath = path.join(os.tmpdir(), 'lanthan-driver.json');

export type Settings = {
  address: string;
  port: number;
  logFile: string;
}

const defaultSettings: Settings = {
  address: '127.0.0.1',
  port: 18000,
  logFile: '/dev/null',
};

const save = (
  opts = {},
  filepath = defaultPath,
): Settings => {
  const settings = Object.assign({}, defaultSettings, opts);
  fs.writeFileSync(filepath, JSON.stringify(settings));
  return settings;
};

const load = (
  filepath = defaultPath,
): Settings => {
  const buf = fs.readFileSync(filepath);
  const opts = JSON.parse(buf.toString());
  return Object.assign({}, defaultSettings, opts);
};

const remove = (
  filepath = defaultPath
): void => {
  fs.unlinkSync(filepath);
};

export {
  save,
  load,
  remove,
};

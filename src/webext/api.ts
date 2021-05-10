import * as metadata from './metadata';
import request from 'request-promise-native';
import errors from 'request-promise-native/errors';

const create = (address: string, port: number): any => {
  const root: any = {};
  const methods = metadata.methods();
  for (const method of methods) {
    let head = root;
    const names = method.split('.');
    for (const name of names.slice(0, -1)) {
      head[name] = head[name] || {};
      head = head[name];
    }
    head[names[names.length - 1]] = async(...args: any[]): Promise<any> => {
      try {
        const response = await request({
          url: `http://${address}:${port}/${method}`,
          method: 'PUT',
          json: args,
        });
        // unwrap due tu result is wrapped as an Array to return a Number
        return response[0];
      } catch (err) {
        if (err instanceof errors.StatusCodeError) {
          const { statusCode } = err;
          const body = err.response.body;
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

export {
  create,
};

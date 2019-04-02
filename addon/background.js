const NATIVA_NAME = 'lanthan_driver';
let port = browser.runtime.connectNative(NATIVA_NAME);

const newResponse = (id, body) => {
  return { id, body };
};

const newErrorResponse = (id, err) => {
  return { id, error: err.message };
};

const onMessage = ({ method, params }) => {
  let keys = method.split('.');
  if (keys[0] !== 'browser') {
    throw new Error('unknown meohod: ' + method);
  }
  keys = keys.slice(1);
  let f = browser;
  for (let key of keys) {
    f = f[key];
    if (typeof f !== 'object' && typeof f !== 'function') {
      throw new Error('unknown meohod: ' + method);
    }
  }
  if (typeof f !== 'function') {
    throw new Error('unknown meohod: ' + method);
  }
  console.log(`invoke: ${method}(${params.map(JSON.stringify).join(',')})`);
  return f(...params);
};

port.onMessage.addListener(async(request) => {
  console.log(JSON.stringify(request));

  let id = request.id;
  try {
    let response = await onMessage(request.body);
    port.postMessage(newResponse(id, response));
  } catch (e) {
    port.postMessage(newErrorResponse(id, e));
    console.error(e);
  }
});

port.onDisconnect.addListener((p) => {
  if (p.error) {
    console.error('Disconnected due to an error:', p.error);
  }
});

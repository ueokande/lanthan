'use strict';

const Server = require('../../lib/webext/Server');
const assert = require('power-assert');
const request = require('request-promise-native');

class MockClient {
  constructor() {
    this.messages = [];
    this.onMessageListener = () => {};
  }

  sendMessage(message) {
    this.messages.push(message);
    this.onMessageListener(message);
  }

  onMessage(listener) {
    this.onMessageListener = listener;
  }
}

class MockListener {
  constructor() {
    this.onMessageListener = () => {};
    this.onErrorListener = () => {};
  }

  listen() {
  }

  onMessage(listener) {
    this.onMessageListener = listener;
  }

  onError(listener) {
    this.onErrorListener = listener;
  }

  invokeMessage(message) {
    this.onMessageListener(message);
  }

  invokeError(err) {
    this.onErrorListener(err);
  }
}

class NullLogger {
  info() {
  }

  warn() {
  }

  error() {
  }
}

const port = '12345';

describe('Server', () => {
  let client;
  let listener;
  let server;

  beforeEach(() => {
    listener = new MockListener();
    client = new MockClient();
    server = new Server('127.0.0.1', port, client, listener, new NullLogger());
    server.listen();
  });

  afterEach(() => {
    server.close();
  });

  describe('routes', () => {
    it('should send messages and receive response', async() => {
      client.onMessage((message) => {
        listener.invokeMessage({
          id: message.id,
          body: 'message from browser',
        });
      });

      let promise = request({
        url: `http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });

      let resp = await promise;

      assert(resp.statusCode === 200);
      assert(resp.body === 'message from browser');

      assert(client.messages.length === 1);
      assert(typeof client.messages[0].id === 'string');
      assert.deepEqual(client.messages[0].body, {
        method: 'browser.tabs.query',
        params: [1, 'b', null],
      });
    });

    it('should send messages and receive response', async() => {
      client.onMessage((message) => {
        listener.invokeMessage({
          id: message.id,
          error: 'error occurs',
        });
      });

      let promise = request({
        url: `http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });

      try {
        await promise;
      } catch (e) {
        let resp = e.response;
        assert(resp.statusCode === 520);
        assert.deepEqual(resp.body, { status: 520, message: 'error occurs' });
      }
    });

    it('should send messages and receive response', async() => {
      client.onMessage((message) => {
        listener.invokeMessage({ id: message.id });
      });

      let promise = request({
        url: `http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });

      try {
        await promise;
      } catch (e) {
        let resp = e.response;
        assert(resp.statusCode === 520);
        assert.deepEqual(resp.body, { status: 520, message: 'unknown response from browser' });
      }
    });

    it('should returns 404 with undefined method name', async() => {
      try {
        await request({
          url: `http://127.0.0.1:${port}/browser.tabs.harakiri`,
          method: 'PUT',
          json: [],
          resolveWithFullResponse: true,
        });
        throw new Error('expected error');
      } catch (e) {
        let resp = e.response;
        assert(resp.statusCode === 404);
        assert(resp.body.status === 404);
        assert(typeof resp.body.message, 'string');
      }
    });

    it('should returns 400 with non-array request body', async() => {
      try {
        await request({
          url: `http://127.0.0.1:${port}/browser.tabs.query`,
          method: 'PUT',
          json: { 'name': 'alice' },
          resolveWithFullResponse: true,
        });
        throw new Error('expected error');
      } catch (e) {
        let resp = e.response;
        assert(resp.statusCode === 400);
        assert(resp.body.status === 400);
        assert(typeof resp.body.message, 'string');
      }
    });

    it('should returns 400 with invalid json', async() => {
      try {
        await request({
          url: `http://127.0.0.1:${port}/browser.tabs.query`,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: `********`,
          resolveWithFullResponse: true,
        });
        throw new Error('expected error');
      } catch (e) {
        let resp = e.response;
        let body = JSON.parse(resp.body);
        assert(resp.statusCode === 400);
        assert(body.status === 400);
        assert(typeof resp.body.message, 'string');
      }
    });
  });
});

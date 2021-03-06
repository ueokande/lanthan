import * as assert from 'assert';
import request from 'request-promise-native';

import { MessageClient } from '../../src/driver/MessageClient'
import { MessageListener, OnMessageListener, OnErrorListener } from '../../src/driver/MessageListener'
import { Logger } from '../../src/driver/Logger'
import Server from '../../src/driver/Server';

type Message = any

class MockClient implements MessageClient {
  public messages: Message[];

  private onMessageListener: (message: Message) => void;

  constructor() {
    this.messages = [];
    this.onMessageListener = () => {};
  }

  sendMessage(message: Message) {
    this.messages.push(message);
    this.onMessageListener(message);
  }

  onMessage(listener: (msg: Message) => void) {
    this.onMessageListener = listener;
  }
}

class MockListener implements MessageListener {
  private onMessageListener: OnMessageListener;

  private onErrorListener: OnErrorListener;

  constructor() {
    this.onMessageListener = () => {};
    this.onErrorListener = () => {};
  }

  listen() {
  }

  onMessage(listener: OnMessageListener) {
    this.onMessageListener = listener;
  }

  onError(listener: OnErrorListener) {
    this.onErrorListener = listener;
  }

  invokeMessage(message: Message) {
    this.onMessageListener(message);
  }

  invokeError(err: Error) {
    this.onErrorListener(err);
  }
}

class NullLogger implements Logger {
  info() {}

  warn() {}

  error() {}
}

const port = 12345;

describe('Server', () => {
  let client: MockClient;
  let listener: MockListener;
  let server: Server;

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
          success: true,
          result: 'message from browser',
        });
      });

      let promise = request({
        url: `http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });

      let resp = await promise;

      assert.strictEqual(resp.statusCode, 200);
      assert.strictEqual(resp.body[0], 'message from browser');

      assert.strictEqual(client.messages.length, 1);
      assert.ok(typeof client.messages[0].id === 'string');
      assert.deepStrictEqual(client.messages[0].body, {
        method: 'browser.tabs.query',
        params: [1, 'b', null],
      });
    });

    it('should send messages and receive empty response', async() => {
      client.onMessage((message) => {
        listener.invokeMessage({
          id: message.id,
          success: true,
        });
      });

      let promise = request({
        url: `http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });

      let resp = await promise;

      assert.strictEqual(resp.statusCode, 200);
      assert.strictEqual(resp.body[0], undefined);
    });

    it('should send messages and receive an error with message', async() => {
      client.onMessage((message) => {
        listener.invokeMessage({
          id: message.id,
          success: false,
          message: 'error occurs',
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
        assert.strictEqual(resp.statusCode, 520);
        assert.deepStrictEqual(resp.body, { status: 520, message: 'error occurs' });
      }
    });

    it('should send messages and an unknown error', async() => {
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
        assert.strictEqual(resp.statusCode, 520);
        assert.deepStrictEqual(resp.body, { status: 520, message: 'unknown response from browser' });
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
        assert.strictEqual(resp.statusCode, 404);
        assert.strictEqual(resp.body.status, 404);
        assert.strictEqual(typeof resp.body.message, 'string');
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
        assert.strictEqual(resp.statusCode, 400);
        assert.strictEqual(resp.body.status, 400);
        assert.strictEqual(typeof resp.body.message, 'string');
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
        assert.strictEqual(resp.statusCode, 400);
        assert.strictEqual(body.status, 400);
        assert.strictEqual(typeof body.message, 'string');
      }
    });
  });
});

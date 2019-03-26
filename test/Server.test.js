const Server = require('../lib/Server');
const assert = require('power-assert');
const request = require('request-promise-native');

class MockClient {
  constructor() {
    this.messages = [];
  }

  sendMessage(message) {
    this.messages.push(message);
  }
}

const port = '12345';

describe('Server', () => {
  let server

  beforeEach(() => {
    client = new MockClient();
    server = new Server('127.0.0.1', port, client);
    server.listen();
  });

  afterEach(() => {
    server.close();
  })

  describe('routes', () => {
    it('should send messages', async () => {
      let resp = await request({
        url:`http://127.0.0.1:${port}/browser.tabs.query`,
        method: 'PUT',
        json: [1, 'b', null],
        resolveWithFullResponse: true,
      });
      assert(resp.statusCode === 200);
      assert.deepEqual(resp.body, { status: 200, message: 'ok' });

      assert(client.messages.length === 1);
      assert.deepEqual(client.messages[0], {
        method: 'browser.tabs.query',
        params: [1, 'b', null],
      });
    });

    it('should returns 404 with undefined method name', async () => {
      try {
        await request({
          url:`http://127.0.0.1:${port}/browser.tabs.harakiri`,
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
    })

    it('should returns 400 with non-array request body', async () => {
      try {
        await request({
          url:`http://127.0.0.1:${port}/browser.tabs.query`,
          method: 'PUT',
          json: { "name": "alice" },
          resolveWithFullResponse: true,
        });
        throw new Error('expected error');
      } catch (e) {
        let resp = e.response;
        assert(resp.statusCode === 400);
        assert(resp.body.status === 400);
        assert(typeof resp.body.message, 'string');
      }
    })

    it('should returns 400 with invalid json', async () => {
      try {
        await request({
          url:`http://127.0.0.1:${port}/browser.tabs.query`,
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
    })
  });
});


'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const metadata = require('./metadata');
const http = require('http');
const uuidv4 = require('uuid/v4');

const newRequest = (body) => {
  let id = uuidv4();
  return { id, body };
};

const {
  HttpError,
  NotFoundError,
  NotAcceptableError,
  BadRequestError,
} = require('./error');

class Server {
  // eslint-disable-next-line max-statements
  constructor(address, port, client, listener, logger) {
    let app = express();
    app.use(bodyParser.json());
    app.get('/health', this.handleHealth.bind(this));
    app.put('/*', this.handleWebext.bind(this));
    app.use(() => {
      throw new NotFoundError('not found');
    });
    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError) {
        res.status(400).send({ status: 400, message: err.message });
      } else if (err instanceof HttpError) {
        res.status(err.status).send({
          status: err.status, message: err.message
        });
      } else {
        res.status(500).send({ status: 500, message: err.message });
      }
      next(err);
    });
    app.use((_err, req, res) => {
      logger.info(
        `"${req.method} ${req.path}",`,
        `${JSON.stringify(req.body)},`,
        ` ${res.statusCode}`);
    });

    listener.onMessage(this.onMessage.bind(this));

    this.address = address;
    this.port = port;
    this.app = app;
    this.server = null;
    this.client = client;
    this.listener = listener;
    this.logger = logger;
    this.pool = {};
  }

  listen() {
    this.listener.listen();
    this.server = http.createServer(this.app);
    this.server.on('listening', () => {
      this.logger.info(`listening on ${this.address}:${this.port}`);
    });
    this.server.on('close', () => {
      this.logger.info('server closed');
    });
    this.server.on('error', (err) => {
      this.logger.error(`error`, err);
    });
    this.server.listen(this.port, this.address);
  }

  close() {
    this.server.close();
  }

  handleWebext(req, res) {
    if (!req.is('application/json')) {
      throw new NotAcceptableError('only application/json is acceptable');
    }

    let method = req.path.slice(1);
    if (!metadata.methods().includes(method)) {
      throw new NotFoundError(`method '${method}' does not exits`);
    }
    if (!(req.body instanceof Array)) {
      throw new BadRequestError('body does not an Array');
    }

    let msg = newRequest({
      method: method,
      params: req.body,
    });
    this.pool[msg.id] = res;
    this.client.sendMessage(msg);
  }

  handleHealth(_req, res) {
    res.status(200).send({ status: 200, message: 'ok' });
  }

  onMessage(message) {
    if (!(message.id in this.pool)) {
      this.logger.warn('unexpected message:', message);
      return;
    }
    let httpResponse = this.pool[message.id];

    delete this.pool[message.id];

    if ('body' in message) {
      httpResponse.status(200).send(message.body);
    } else if ('error' in message) {
      httpResponse.status(520).send({ status: 520, message: message.error });
    } else {
      httpResponse.status(520).send(
        { status: 520, message: 'unknown response from browser' }
      );
    }
  }
}

module.exports = Server;

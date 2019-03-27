const bodyParser = require('body-parser');
const express = require('express')
const metadata = require('./metadata');
const message = require('./message');
const {
  HttpError,
  NotFoundError,
  NotAcceptableError,
  BadRequestError,
} = require('./error');

class Server {
  constructor(address, port, client, listener) {
    let app = express();
    app.use(bodyParser.json());
    app.put('/*', this.handle.bind(this))
    app.use((req, res) => {
      throw new NotFoundError('not found');
    })
    app.use(function (err, req, res, next) {
      if (err instanceof SyntaxError) {
        res.status(400).send({ status: 400, message: err.message })
      } else if (err instanceof HttpError) {
        res.status(err.status).send({ status: err.status, message: err.message })
      } else {
        res.status(500).send({ status: 500, message: err.message })
      }
    })

    listener.onMessage(this.onMessage.bind(this));

    this.address = address;
    this.port = port;
    this.app = app;
    this.server = null;
    this.client = client;
    this.pool = {};
  }

  listen() {
    this.server = this.app.listen(this.port, this.address);
  }

  close() {
    this.server.close();
  }

  handle(req, res) {
    if (!req.is('application/json')) {
      throw new NotAcceptableError('only application/json is acceptable')
    }

    let method = req.path.slice(1)
    if (!metadata.methods().includes(method)) {
      throw new NotFoundError(`method "${req.path} does not exits`);
    }
    if (!(req.body instanceof Array)) {
      throw new BadRequestError('body does not an Array');
    }

    let msg = message.newRequest({
      method: method,
      params: req.body,
    });
    this.pool[msg.id] = res;
    this.client.sendMessage(msg);
  }

  onMessage(message) {
    if (!(message.id in this.pool)) {
      console.warn('unexpected message:', message);
      return;
    }
    let httpResponse = this.pool[message.id];

    delete this.pool[message.id];

    if ('body' in message) {
      httpResponse.status(200).send(message.body)
    } else if ('error' in message) {
      httpResponse.status(520).send({ status: 520, message: message.error });
    } else {
      httpResponse.status(520).send({ status: 520, message: 'unknown response from browser' });
    }
  }
}

module.exports = Server;

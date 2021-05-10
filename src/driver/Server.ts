import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import uuidv4 from 'uuid/v4';

import * as metadata from '../webext/metadata';
import { MessageListener } from './MessageListener';
import { MessageClient } from './MessageClient';
import { Logger } from './Logger';

import {
  HttpError,
  NotFoundError,
  NotAcceptableError,
  BadRequestError,
} from '../webext/error';

class Server {
  private app: express.Application;

  private server: http.Server | undefined;

  private pool: { [key: string]: express.Response };

  // eslint-disable-next-line max-statements
  constructor(
    private address: string,
    private port: number,
    private client: MessageClient,
    private listener: MessageListener,
    private logger: Logger,
  ) {
    const app = express();
    app.use(bodyParser.json());
    app.get('/health', this.handleHealth.bind(this));
    app.put('/*', this.handleWebext.bind(this));
    app.use(() => {
      throw new NotFoundError('not found');
    });
    app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError) {
        res.status(400).send({ status: 400, message: err.message });
      } else if (err instanceof HttpError) {
        res.status(err.status).send({
          status: err.status, message: err.message
        });
      } else if (err) {
        res.status(500).send({ status: 500, message: err.message });
      }
      next(err);
    });
    app.use((_err, req: express.Request, res: express.Response) => {
      logger.info(
        `"${req.method} ${req.path}",`,
        `${JSON.stringify(req.body)},`,
        ` ${res.statusCode}`);
    });
    listener.onMessage(this.onMessage.bind(this));

    this.app = app;
    this.pool = {};
  }

  listen(): void {
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

  close(): void {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    }
  }

  private handleWebext(req: express.Request, res: express.Response): void {
    if (!req.is('application/json')) {
      throw new NotAcceptableError('only application/json is acceptable');
    }

    const method = req.path.slice(1);
    if (!metadata.methods().includes(method)) {
      throw new NotFoundError(`method '${method}' does not exits`);
    }
    if (!(req.body instanceof Array)) {
      throw new BadRequestError('body does not an Array');
    }

    const msg = {
      id: uuidv4(),
      body: {
        method: method,
        params: req.body,
      }
    };
    this.pool[msg.id] = res;
    this.client.sendMessage(msg);
  }

  private handleHealth(_req: express.Request, res: express.Response): void {
    res.status(200).send({ status: 200, message: 'ok' });
  }

  private onMessage(message: any): void {
    if (!(message.id in this.pool)) {
      this.logger.warn('unexpected message:', message);
      return;
    }
    const httpResponse = this.pool[message.id];

    delete this.pool[message.id];

    if (!('success' in message)) {
      httpResponse.status(520).send(
        { status: 520, message: 'unknown response from browser' }
      );
      return;
    }
    if (message.success) {
      // wrap result as an Array to return a Number
      if (typeof message.result === 'undefined') {
        // due to JSON.stringify() converts undefined to null
        httpResponse.status(200).send([]);
      } else {
        httpResponse.status(200).send([message.result]);
      }
    } else {
      httpResponse.status(520).send(
        { status: 520, message: message.message }
      );
    }
  }
}

export default Server;

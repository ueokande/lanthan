#!/usr/bin/env node

'use strict';

const os = require('os');

const config = require('../lib/config');
const MessageClient = require('../lib/driver/MessageClient');
const MessageListener = require('../lib/driver/MessageListener');
const Logger = require('../lib/driver/Logger');
const Server = require('../lib/driver/Server');

const main = () => {
  let conf = config.load();

  let client = new MessageClient(process.stdout);
  let listener = new MessageListener(process.stdin);
  let logger = new Logger(conf.logFile);

  logger.info(`started lanthan-driver on ${conf.address}:${conf.port}`);

  let server = null;
  try {
    server = new Server(conf.address, conf.port, client, listener, logger);
    server.listen();
  } catch (e) {
    logger.error(e);
    os.exit(1);
  }
  process.on('SIGTERM', () => {
    server.close();
  });
};

main();

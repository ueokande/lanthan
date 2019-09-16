#!/usr/bin/env node

'use strict';

const config = require('../dist/config');
const { MessageClientImpl } = require('../dist/driver/MessageClient');
const { MessageListenerImpl } = require('../dist/driver/MessageListener');
const { FileLogger } = require('../dist/driver/Logger');
const Server = require('../dist/driver/Server').default;

const main = () => {
  let conf = config.load();

  let client = new MessageClientImpl(process.stdout);
  let listener = new MessageListenerImpl(process.stdin);
  let logger = new FileLogger(conf.logFile);

  logger.info(`started lanthan-driver on ${conf.address}:${conf.port}`);

  let server = null;
  try {
    server = new Server(conf.address, conf.port, client, listener, logger);
    server.listen();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
  process.on('SIGTERM', () => {
    server.close();
  });
};

main();

#!/usr/bin/env node

'use strict';

const pkg = require('../package.json');
const program = require('commander');
const path = require('path');
const os = require('os');

const config = require('../lib/config');
const MessageClient = require('../lib/driver/MessageClient');
const MessageListener = require('../lib/driver/MessageListener');
const Logger = require('../lib/driver/Logger');
const Server = require('../lib/driver/Server');

const defaultConfigPath = path.join(os.tmpdir(), 'lanthan-driver.json');

const main = () => {
  program
    .version(pkg.version)
    .option('-c, --config <path>', 'path to configuration file',
      defaultConfigPath)
    .parse(process.argv);

  let conf = config.loadFrom(program.config);

  let client = new MessageClient(process.stdout);
  let listener = new MessageListener(process.stdin);
  let logger = new Logger(conf.logFile);

  logger.info(`started with configuration file '${program.config}':`,
    `address=${conf.address},`,
    `port=${conf.port},`,
    `logFile=${conf.logFile}`);

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

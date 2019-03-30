#!/usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');
const path = require('path');
const os = require('os');

const config = require('../lib/config');
const MessageClient = require('../lib/webext/MessageClient');
const MessageListener = require('../lib/webext/MessageListener');
const Logger = require('../lib/webext/Logger');
const Server = require('../lib/webext/Server');

const defaultConfigPath = path.join(os.tmpdir(), 'webext-driver.json');

const main = () => {
  program
    .version(pkg.version)
    .option('-c, --config <path>', 'path to configuration file', defaultConfigPath)
    .parse(process.argv);

  let conf = config.loadFrom(program.config);

  let client = new MessageClient(process.stdout);
  let listener = new MessageListener(process.stdin);
  let logger = new Logger(conf.logFile);

  logger.info(`started with configuration file '${program.config}':`,
    `address=${conf.address},`,
    `port=${conf.port},`,
    `logFile=${conf.logFile}`)

  try {
    server = new Server(conf.address, conf.port, client, listener, logger);
    server.listen();
  } catch(e) {
    logger.error(e);
    os.exit(1);
  }
  process.on('SIGTERM', () => {
    server.close();
  });
}

try {
  main();
} catch (e) {
  console.error(e);
  os.exit(1);
}

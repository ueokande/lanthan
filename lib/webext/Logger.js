const fs = require('fs');

class Logger {
  constructor(path) {
    this.path = path;
  }

  info(message) {
    this.append('INFO', message);
  }

  warn(message) {
    this.append('WARN', message);
  }

  error(message) {
    this.append('ERROR', message);
  }

  append(level, message) {
    let line = `${new Date().toISOString()} [${level}] ${message}\n`
    fs.appendFile(this.path, line, (err) => {
      if (err) throw err;
    });
  }
}

module.exports = Logger;

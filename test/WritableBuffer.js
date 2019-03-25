const { Writable } = require('stream');

class WritableBuffer extends Writable {

  constructor() {
    super();
    this.data = Buffer.alloc(0);
  }

  write(chunk) {
    this.data = Buffer.concat([this.data, chunk]);
  }
}

module.exports = WritableBuffer;

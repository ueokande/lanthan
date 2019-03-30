const EventEmitter = require('events');
const { Writable } = require('stream');

class ReadableBuffer extends Writable {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
  }

  read(length) {
    if (this.buffer === null) {
      // closed
      return null;
    }
    if (length) {
      let ret = this.buffer;
      this.buffer = Buffer.alloc(0);
      return ret
    }
    let ret = this.buffer.slice(0, length)
    this.buffer = this.buffer.slice(length);
    return ret;
  }

  write(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.emit('readable');
  }

  close() {
    this.buffer = null;
    this.emit('close');
  }
}

module.exports = ReadableBuffer;

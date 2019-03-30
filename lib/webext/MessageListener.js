class MessageListener {
  constructor(r) {
    this.r = r;
    this.onMessageListener = () => {};
    this.onErrorListener = () => {};
  }

  onMessage(listener) {
    this.onMessageListener = listener;
  }

  onError(listener) {
    this.onErrorListener = listener;
  }

  listen() {
    let buffer = Buffer.alloc(0);
    let remaining = 4;
    let readingHeader = true;

    this.r.on('readable', () => {
      try {
        let chunk;
        while (null !== (chunk = this.r.read(remaining))) {
          remaining -= chunk.length;
          buffer = Buffer.concat([buffer, chunk]);

          if (remaining !== 0) {
            continue
          }

          if (readingHeader) {
            remaining = buffer.readUInt32LE();
          } else {
            remaining = 4;
            let message = JSON.parse(buffer);
            this.onMessageListener(message);
          }
          readingHeader = !readingHeader
          buffer = Buffer.alloc(0);
        }
      } catch (e) {
        this.onErrorListener(e);
      }
    });
  }
}

module.exports = MessageListener;

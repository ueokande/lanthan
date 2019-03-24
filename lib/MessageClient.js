class MessageClient {
  constructor(w) {
    this.w = w;
  }

  sendMessage(message) {
    let dataBytes = Buffer.from(JSON.stringify(message));
    let lenBytes = Buffer.alloc(4);
    lenBytes.writeUInt32LE(dataBytes.length, 0);

    this.w.write(lenBytes);
    this.w.write(dataBytes);
  }
}

module.exports = MessageClient;

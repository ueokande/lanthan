import * as stream from 'stream';

export interface MessageClient {
  sendMessage(message: any): void;
}

export class MessageClientImpl {
  constructor(private w: stream.Writable) {
  }

  sendMessage(message: any): void {
    const dataBytes = Buffer.from(JSON.stringify(message));
    const lenBytes = Buffer.alloc(4);
    lenBytes.writeUInt32LE(dataBytes.length, 0);

    this.w.write(lenBytes);
    this.w.write(dataBytes);
  }
}

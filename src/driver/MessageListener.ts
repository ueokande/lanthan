import * as stream from 'stream';

export type OnMessageListener = (message: object) => void;
export type OnErrorListener = (error: Error) => void;

export interface MessageListener {
  onMessage(listener: OnMessageListener): void;

  onError(listener: OnErrorListener): void;

  listen(): void;
}

export class MessageListenerImpl {
  private onMessageListener: OnMessageListener;

  private onErrorListener: OnErrorListener;

  constructor(private r: stream.Readable) {
    this.onMessageListener = (): void => {};
    this.onErrorListener = (): void => {};
  }

  onMessage(listener: OnMessageListener): void {
    this.onMessageListener = listener;
  }

  onError(listener: OnErrorListener): void {
    this.onErrorListener = listener;
  }

  listen(): void {
    let buffer = Buffer.alloc(0);
    let remaining = 4;
    let readingHeader = true;

    this.r.on('readable', () => {
      try {
        let chunk = null;
        while ((chunk = this.r.read(remaining)) !== null) {
          remaining -= chunk.length;
          buffer = Buffer.concat([buffer, chunk]);

          if (remaining !== 0) {
            continue;
          }

          if (readingHeader) {
            remaining = buffer.readUInt32LE(0);
          } else {
            remaining = 4;
            const message = JSON.parse(buffer.toString());
            this.onMessageListener(message);
          }
          readingHeader = !readingHeader;
          buffer = Buffer.alloc(0);
        }
      } catch (e: any) {
        this.onErrorListener(e);
      }
    });
  }
}

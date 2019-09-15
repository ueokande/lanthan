import * as fs from 'fs';

export interface Logger {
  info(...message: any[]): void

  warn(...message: any[]): void

  error(...message: any[]): void
}

export class FileLogger {
  constructor(private path: string) {
  }

  info(...message: any[]) {
    this.append('INFO', ...message);
  }

  warn(...message: any[]) {
    this.append('WARN', ...message);
  }

  error(...message: any[]) {
    this.append('ERROR', ...message);
  }

  private append(level: string, ...message: any[]) {
    let line = `${new Date().toISOString()} [${level}] ${message.join(' ')}\n`;
    fs.appendFileSync(this.path, line);
  }
}

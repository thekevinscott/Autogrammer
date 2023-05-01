import { Server, } from "http";
import express, {
  Express,
  // Server,
} from 'express';

import cors from 'cors';

const serversToClose = [];
process.on('exit', async () => await Promise.all(serversToClose.map(server => server.close())));

export default class MockLLMAPI {
  app: Express = express();
  server: Server;
  port: number;

  constructor() {
    this.app.use(express.json());
    this.app.use(cors({
      origin: '*',
    }));
    const server = this.app.listen();
    this.server = server;
    const address = server.address();
    if (isString(address)) {
      throw new Error('Server address is a string');
    }
    this.port = address.port;
    serversToClose.push(server);
  }

  stop = () => new Promise<void>((resolve, reject) => {
    this.server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const isString = (value: unknown): value is string => value instanceof String || typeof value === 'string';


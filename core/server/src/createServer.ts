// core/server/src/createServer.ts

import http from 'http';
import { createSocketServer } from './socket/socketServer';

export function createServer(app: any) {
  const server = http.createServer(app);

  createSocketServer(server);

  return server;
}

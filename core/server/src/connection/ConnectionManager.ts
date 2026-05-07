import type { Socket } from 'socket.io';

export class ConnectionManager {
  private playerSockets = new Map<string, Set<Socket>>();

  connect(playerId: string, socket: Socket) {
    const sockets = this.playerSockets.get(playerId);

    if (!sockets) {
      this.playerSockets.set(playerId, new Set([socket]));
      return;
    }

    sockets.add(socket);
  }

  disconnect(playerId: string, socket: Socket) {
    const sockets = this.playerSockets.get(playerId);

    if (!sockets) {
      return;
    }

    sockets.delete(socket);

    if (sockets.size === 0) {
      this.playerSockets.delete(playerId);
    }
  }

  getSockets(playerId: string): Socket[] {
    return [...(this.playerSockets.get(playerId) ?? [])];
  }

  getSocket(playerId: string): Socket | undefined {
    return this.getSockets(playerId)[0];
  }

  isConnected(playerId: string): boolean {
    return this.playerSockets.has(playerId);
  }

  emitToPlayer<T>(playerId: string, eventName: string, payload: T) {
    const sockets = this.getSockets(playerId);

    sockets.forEach((socket) => {
      socket.emit(eventName, payload);
    });
  }

  emitToPlayers<T>(
    playerIds: string[],
    eventName: string,
    payloadFactory: (playerId: string) => T,
  ) {
    playerIds.forEach((playerId) => {
      this.emitToPlayer(playerId, eventName, payloadFactory(playerId));
    });
  }

  isCurrentSocket(playerId: string, socket: Socket): boolean {
    const sockets = this.playerSockets.get(playerId);

    if (!sockets) {
      return false;
    }

    return sockets.has(socket);
  }

  clearPlayer(playerId: string) {
    this.playerSockets.delete(playerId);
  }
}

export const connectionManager = new ConnectionManager();

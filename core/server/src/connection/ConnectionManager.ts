import type { Socket } from 'socket.io';

class ConnectionManager {
  private playerSockets = new Map<string, Socket>();

  connect(playerId: string, socket: Socket) {
    const oldSocket = this.playerSockets.get(playerId);

    this.playerSockets.set(playerId, socket);

    // 同一playerの古い接続を切断
    if (oldSocket && oldSocket.id !== socket.id) {
      oldSocket.disconnect();
    }
  }

  disconnect(playerId: string, socket: Socket) {
    const currentSocket = this.playerSockets.get(playerId);

    // 古いsocketのdisconnectは無視
    if (!currentSocket || currentSocket.id !== socket.id) {
      return;
    }

    this.playerSockets.delete(playerId);
  }

  // getSockets removed

  getSocket(playerId: string): Socket | undefined {
    return this.playerSockets.get(playerId);
  }

  isConnected(playerId: string): boolean {
    return this.playerSockets.has(playerId);
  }

  emitToPlayer<T>(playerId: string, eventName: string, payload: T) {
    const socket = this.getSocket(playerId);

    socket?.emit(eventName, payload);
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
    const currentSocket = this.playerSockets.get(playerId);

    if (!currentSocket) {
      return false;
    }

    return currentSocket.id === socket.id;
  }

  clearPlayer(playerId: string) {
    this.playerSockets.delete(playerId);
  }
}

export const connectionManager = new ConnectionManager();

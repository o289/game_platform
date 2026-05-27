// client/socket/SocketClient.ts

import { io, Socket } from 'socket.io-client';
import { Action } from 'shared/types';

const SOCKET_EVENTS = [
  'gameStateUpdate',
  'roomUpdate',
  'gameStarted',
  'roomCreated',
  'roomClosed',
  'announce_error',
  'gameSelected',
  'leftRoom',
] as const;

type SocketEvents = (typeof SOCKET_EVENTS)[number];

type AuthPayload = {
  roomId?: string;
  playerId?: string;
};

class SocketClient {
  private socket: Socket;
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map();

  private currentAuth: AuthPayload = {};

  constructor(url?: string) {
    this.socket = io(url ?? '', {
      transports: ['websocket'],
      autoConnect: false,
    });

    this.registerCoreEvents();
  }

  private ensureConnected(callback: () => void) {
    if (!this.socket.connected) {
      this.socket.connect();
      this.socket.once('connect', callback);
    } else {
      callback();
    }
  }

  // ------------------------
  // Core
  // ------------------------

  connect(auth?: AuthPayload) {
    if (auth) {
      this.currentAuth = auth;
    }

    this.socket.auth = this.currentAuth;
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
  // ------------------------
  // Room
  // ------------------------
  createRoom(playerId: string, name: string) {
    this.ensureConnected(() => {
      this.socket.emit('createRoom', {
        playerId,
        name,
      });
    });
  }

  joinRoom(roomId: string, playerId: string, name: string) {
    this.currentAuth = { roomId, playerId };

    this.ensureConnected(() => {
      this.socket.emit('joinRoom', {
        roomId,
        playerId,
        name,
      });
    });
  }

  leaveRoom() {
    this.socket.emit('leaveRoom');
  }

  // ------------------------
  // Game Lifecycle
  // ------------------------

  startGame(roomId: string, gameType: string, config?: unknown) {
    this.ensureConnected(() => {
      this.socket.emit('startGame', {
        roomId,
        gameType,
        config,
      });
    });
  }

  selectGame(roomId: string, gameType: string) {
    this.ensureConnected(() => {
      this.socket.emit('selectGame', {
        roomId,
        gameType,
      });
    });
  }

  rematch(roomId: string) {
    this.ensureConnected(() => {
      this.socket.emit('rematch', { roomId });
    });
  }

  backToConfig(roomId: string) {
    this.ensureConnected(() => {
      this.socket.emit('backToConfig', { roomId });
    });
  }

  resetGame(roomId: string) {
    this.ensureConnected(() => {
      this.socket.emit('resetGame', { roomId });
    });
  }

  // ------------------------
  // Actions（統一）
  // ------------------------

  sendAction<T = any>(action: Action<T>) {
    this.ensureConnected(() => {
      this.socket.emit('action', action);
    });

    return;
  }

  // ------------------------
  // Assets
  // ------------------------
  assetLoaded() {
    this.ensureConnected(() => {
      this.socket.emit('assetLoaded');
    });
  }

  // ------------------------
  // Event System（汎用）
  // ------------------------

  on(event: SocketEvents, callback: (data: unknown) => void) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(callback);
  }

  off(event: SocketEvents, callback?: (data: unknown) => void) {
    if (!this.handlers.has(event)) return;

    if (!callback) {
      this.handlers.delete(event);
      return;
    }

    this.handlers.get(event)!.delete(callback);
  }

  // ------------------------
  // Announce Error（専用ヘルパー）
  // ------------------------

  onAnnounceError(callback: (data: any) => void) {
    this.on('announce_error', callback);
  }

  offAnnounceError(callback?: (data: any) => void) {
    this.off('announce_error', callback);
  }

  // ------------------------
  // Internal
  // ------------------------

  private registerCoreEvents() {
    const events = SOCKET_EVENTS;

    events.forEach((event) => {
      this.socket.on(event, (data: unknown) => {
        const handlers = this.handlers.get(event);
        if (!handlers) return;

        handlers.forEach((fn) => fn(data));
      });
    });

    this.socket.on('connect', () => {
      // 🔥 念のため接続時にもauthを再適用
      this.socket.auth = this.currentAuth;
    });

    this.socket.on('disconnect', () => {});

    // 🔥 reconnect時にauthを再適用
    this.socket.io.on('reconnect_attempt', () => {
      this.socket.auth = this.currentAuth;
    });
  }
}

export const socketClient = new SocketClient();

import { Room, SystemError } from 'shared/types';

export class RoomManager {
  private rooms = new Map<string, Room>();
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>(); // key: `${roomId}:${playerId}`

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  createRoom(
    roomId: string,
    hostId: string,
    socketId: string,
    name: string,
    isDisconnected: boolean = false,
  ): Room {
    if (this.rooms.has(roomId)) {
      throw new SystemError(
        'ROOM_ALREADY_EXISTS',
        'そのルームはすでに作られています',
      );
    }

    const room: Room = {
      id: roomId,
      hostId,
      players: [{ id: hostId, name, socketId, isDisconnected }],
      status: 'waiting',

      // ゲーム関連
      gameType: null, // 後で選択
      gameState: null as unknown,
      gameConfig: null as unknown,

      // event sourcing
      actionLogs: [],
    } as Room;

    this.rooms.set(roomId, room);

    return room;
  }

  joinRoom(
    roomId: string,
    playerId: string,
    socketId: string,
    name: string,
    isDisconnected: boolean = false,
  ): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError('ROOM_NOT_FOUND', '部屋が見つかりません');
    }

    const existing = room.players.find((p) => p.id === playerId);

    // 🔥 reconnect対応
    if (existing) {
      existing.socketId = socketId;
      existing.name = name;

      // 🔥 disconnectタイマー解除
      this.clearDisconnectTimeout(roomId, playerId);

      return room;
    }

    // 🔥 新規参加のみ許可
    if (room.status !== 'waiting') {
      throw new SystemError(
        'GAME_ALREADY_STARTED',
        'ゲームはすでに開始されています',
      );
    }

    if (room.players.length >= 4) {
      throw new SystemError('ROOM_FULL', 'ルームの参加上限に達しています');
    }

    room.players.push({ id: playerId, name, socketId, isDisconnected });

    return room;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return;
    }

    // 🔥 ホストは自動変更しない（reconnect対応のため）
    if (room.hostId === playerId) {
      console.log(
        '⚠️ host left (manual leave), keeping hostId until handled explicitly',
      );
    }
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  setDisconnectTimeout(
    roomId: string,
    playerId: string,
    timeout: NodeJS.Timeout,
  ) {
    const key = `${roomId}:${playerId}`;
    const existing = this.disconnectTimeouts.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    this.disconnectTimeouts.set(key, timeout);
  }

  clearDisconnectTimeout(roomId: string, playerId: string) {
    const key = `${roomId}:${playerId}`;
    const timeout = this.disconnectTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.disconnectTimeouts.delete(key);
    }
  }

  getGameState(roomId: string): unknown {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError('ROOM_NOT_FOUND', '部屋が見つかりません');
    }

    if (!room.gameType) {
      throw new SystemError(
        'GAME_NOT_INITIALIZED',
        'ゲームタイプが設定されていません',
      );
    }

    return room.status;
  }

  setGameState(roomId: string, gameState: unknown) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError('ROOM_NOT_FOUND', '部屋が見つかりません');
    }

    // キャッシュとして保存（真実はactionLogs）
    room.gameState = gameState;
  }

  getPlayers(roomId: string): string[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError('ROOM_NOT_FOUND', '部屋が見つかりません');
    }

    return room.players.map((p) => p.id);
  }

  getSocketId(roomId: string, playerId: string): string | undefined {
    const room = this.rooms.get(roomId);

    if (!room) return undefined;

    return room.players.find((p) => p.id === playerId)?.socketId;
  }
}

export const roomManager = new RoomManager();

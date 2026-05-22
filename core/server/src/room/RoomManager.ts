import { Room, Player, SystemError } from 'shared/types';

export class RoomManager {
  private rooms = new Map<string, Room>();
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>(); // key: `${roomId}:${playerId}`

  private createPlayer(id: string, name: string): Player {
    return {
      id,
      name,
      isDisconnected: false,
      isAssetReady: false,
    };
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  createRoom(roomId: string, hostId: string, name: string): Room {
    if (this.rooms.has(roomId)) {
      throw new SystemError({
        code: 'ROOM_ALREADY_EXISTS',
        message: 'そのルームはすでに作られています',
        recovery: [],
      });
    }

    const room: Room = {
      id: roomId,
      hostId,
      players: [this.createPlayer(hostId, name)],
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

  joinRoom(roomId: string, playerId: string, name: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: '部屋が見つかりません',
        recovery: [],
      });
    }

    const existing = room.players.find((p) => p.id === playerId);

    // 🔥 reconnect対応
    if (existing) {
      existing.name = name;

      // 🔥 disconnectタイマー解除
      this.clearDisconnectTimeout(roomId, playerId);

      return room;
    }

    // 🔥 新規参加のみ許可
    if (room.status !== 'waiting') {
      throw new SystemError({
        code: 'GAME_ALREADY_STARTED',
        message: 'ゲームはすでに開始されています',
        recovery: [],
      });
    }

    if (room.players.length >= 4) {
      throw new SystemError({
        code: 'ROOM_FULL',
        message: 'ルームの参加上限に達しています',
        recovery: [],
      });
    }

    room.players.push(this.createPlayer(playerId, name));

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
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: '部屋が見つかりません',
        recovery: [],
      });
    }

    if (!room.gameType) {
      throw new SystemError({
        code: 'GAME_NOT_INITIALIZED',
        message: 'ゲームタイプが設定されていません',
        recovery: [],
      });
    }

    return room.status;
  }

  setGameState(roomId: string, gameState: unknown) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: '部屋が見つかりません',
        recovery: [],
      });
    }

    // キャッシュとして保存（真実はactionLogs）
    room.gameState = gameState;
  }

  getPlayers(roomId: string): string[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: '部屋が見つかりません',
        recovery: [],
      });
    }

    return room.players.map((p) => p.id);
  }
}

export const roomManager = new RoomManager();

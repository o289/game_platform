import { Server } from 'socket.io';
import { roomManager } from '../room/RoomManager';
import { connectionManager } from '../connection/ConnectionManager';
import { SystemError, Player, Room } from 'shared/types';
import { getGameDefinition } from '@core-server/gameRegistry';

function generateRoomId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export function createSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // 🔥 共通: roomUpdate emit helper
  const emitRoomUpdate = (roomId: string) => {
    try {
      const room = roomManager.getRoom(roomId);

      if (!room) {
        throw new SystemError('ROOM_NOT_FOUND', `room not found: ${roomId}`);
      }

      io.to(roomId).emit('roomUpdate', {
        ...room,
      });
    } catch (err) {
      // 別で処理を実装
      if (err instanceof SystemError) {
        console.error('[socket] roomUpdate error', err.code, err.message);
      } else {
        console.error('[socket] roomUpdate unexpected error', err);
      }
    }
  };

  // ⭐ 共通: gameState送信（public/private対応）
  const emitGameState = (
    room: Room,
    state: any,
    eventName: string,
    engine: any,
  ) => {
    const toPublic = engine.toPublicState;

    if (toPublic) {
      room.players.forEach((p: any) => {
        const outputState = toPublic(state, p.id);

        connectionManager.emitToPlayer(p.id, eventName, outputState);
      });
    } else {
      io.to(room.id).emit(eventName, state);
    }
  };

  io.on('connection', (socket) => {
    // 🔥 接続時に復帰処理（authベース）
    const { roomId: authRoomId, playerId: authPlayerId } =
      socket.handshake.auth || {};

    if (authRoomId && authPlayerId) {
      const room = roomManager.getRoom(authRoomId);
      const player = room?.players.find((p: any) => p.id === authPlayerId);

      if (room && player) {
        socket.join(authRoomId);

        player.isDisconnected = false;

        // 🔥 socketにplayer情報を保持
        socket.data.playerId = authPlayerId;
        socket.data.roomId = authRoomId;

        // 🔥 reconnect playerを先に登録
        connectionManager.connect(authPlayerId, socket);

        // 🔥 reconnect成功時は常に状態同期
        emitRoomUpdate(authRoomId);

        if (room.gameType && room.gameState) {
          const engine = getGameDefinition(room.gameType).engine;

          emitGameState(room, room.gameState, 'gameStateUpdate', engine);
        }

        // 🔥 reconnect時：削除タイマーキャンセル
        roomManager.clearDisconnectTimeout?.(authRoomId, authPlayerId);
      }
    }

    // ルームを新規作成
    socket.on('createRoom', ({ playerId, name }) => {
      if (!name) return;

      // サーバー側でroomId生成
      const roomId = generateRoomId();

      // room作成
      const room = roomManager.createRoom(roomId, playerId, name);

      // socket情報保持
      socket.data.playerId = playerId;
      socket.data.roomId = roomId;

      // connection登録
      connectionManager.connect(playerId, socket);

      // socket.io room参加
      socket.join(roomId);

      // クライアントへroomId返却
      socket.emit('roomCreated', {
        roomId,
        playerId,
        room,
      });

      // 全体同期
      emitRoomUpdate(roomId);
    });

    // ルーム参加
    socket.on('joinRoom', ({ roomId, playerId, name }) => {
      if (!name) return;

      // ** ルームエラーはsystemErrorを発動させて、それとして処理する **
      // const room = roomManager.getRoom(roomId);

      // if (!room) {
      //   socket.emit('join_error', {
      //     code: 'ROOM_NOT_FOUND',
      //   });
      //   return;
      // }

      roomManager.joinRoom(roomId, playerId, name);

      // socket情報更新
      socket.data.playerId = playerId;
      socket.data.roomId = roomId;

      connectionManager.connect(playerId, socket);

      socket.join(roomId);

      // 🔥 join時に全員へroom状態を通知
      emitRoomUpdate(roomId);
    });

    // ルーム退出（能動退出）
    socket.on('leaveRoom', () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // reconnect猶予タイマーを削除
      roomManager.clearDisconnectTimeout?.(roomId, playerId);

      // socket接続解除
      connectionManager.disconnect(playerId, socket);

      // roomからプレイヤー削除
      roomManager.leaveRoom(roomId, playerId);

      // socket room離脱
      socket.leave(roomId);

      const updatedRoom = roomManager.getRoom(roomId);

      // 誰もいなくなったらroom削除
      if (!updatedRoom || updatedRoom.players.length === 0) {
        roomManager.deleteRoom(roomId);
        io.to(roomId).emit('roomClosed');
        return;
      }

      // host退出ならroom削除
      if (updatedRoom.hostId === playerId) {
        roomManager.deleteRoom(roomId);
        io.to(roomId).emit('roomClosed');
        return;
      }

      emitRoomUpdate(roomId);
    });

    // ゲームアクション
    socket.on('action', (action) => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      if (!room.gameType) {
        console.warn('action ignored: gameType not set');
        return;
      }

      const engine = getGameDefinition(room.gameType).engine;

      // 🔥 初期化（初回のみ）
      if (!room.gameState) return;

      const enrichedAction = {
        ...action,
        timestamp: Date.now(),
      };

      room.actionLogs.push(enrichedAction);

      try {
        const newState = engine.handleAction(
          room.gameState,
          enrichedAction,
          room.gameConfig,
        );

        room.gameState = newState;

        emitGameState(room, newState, 'gameStateUpdate', engine);
      } catch (err: any) {
        // ゲーム固有エラーをそのままクライアントに返す
        socket.emit('action_error', {
          code: err?.code ?? 'UNKNOWN',
          message: err?.message ?? 'Unknown error',
        });
      }
    });

    // ゲームを選択
    socket.on('selectGame', ({ roomId, gameType }) => {
      const room = roomManager.getRoom(roomId);

      if (!room) return;

      room.gameType = gameType;

      room.status = 'gameWaiting';

      emitRoomUpdate(roomId);
    });

    // 🔧 共通: ゲーム初期化処理
    const initializeGame = (room: any) => {
      const engine = getGameDefinition(room.gameType).engine;

      const initialState = engine.init({
        ...room.gameConfig,
        players: room.players,
      });

      room.gameState = initialState;
      room.actionLogs = [];
      room.status = 'playing';

      return initialState;
    };

    // ゲーム開始
    socket.on('startGame', ({ roomId, gameType, config }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;

      if (!gameType) return;

      // ゲーム設定
      room.gameType = gameType;
      room.gameConfig = config ?? {};

      try {
        const initialState = initializeGame(room);

        emitRoomUpdate(roomId);

        const engine = getGameDefinition(gameType).engine;

        emitGameState(room, initialState, 'gameStarted', engine);
        emitGameState(room, initialState, 'gameStateUpdate', engine);
      } catch (err) {
        console.error('startGame failed', err);
      }
    });

    // 🔁 リマッチ（同じ設定で再プレイ）
    socket.on('rematch', ({ roomId }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;
      if (!room.gameType) return;

      try {
        const initialState = initializeGame(room);

        emitRoomUpdate(roomId);

        const engine = getGameDefinition(room.gameType!).engine;

        emitGameState(room, initialState, 'gameStarted', engine);
        emitGameState(room, initialState, 'gameStateUpdate', engine);
      } catch (err) {
        console.error('rematch failed', err);
      }
    });

    // ⚙️ 設定画面に戻る
    socket.on('backToConfig', ({ roomId }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;

      try {
        room.gameState = null;
        room.gameConfig = null;
        room.actionLogs = [];

        room.status = 'gameWaiting';

        io.to(roomId).emit('gameStateUpdate', null);

        emitRoomUpdate(roomId);
      } catch (err) {
        console.error('backToConfig failed', err);
      }
    });

    // ゲームリセット
    socket.on('resetGame', ({ roomId }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;

      if (!room.gameType) return;

      try {
        room.gameType = null;
        room.gameState = null;
        room.gameConfig = null;
        room.actionLogs = [];
        room.status = 'waiting';

        room.players.forEach((p: Player) => {
          p.isAssetReady = false;
        });

        // 🔥 これが超重要
        io.to(roomId).emit('gameStateUpdate', null);

        emitRoomUpdate(roomId);
      } catch (err) {
        console.error('resetGame failed', err);
      }
    });

    // アセットロードの状態通知
    socket.on('assetLoaded', () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (!playerId || !roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.players.find((p: Player) => p.id === playerId);

      if (!player) return;

      player.isAssetReady = true;

      emitRoomUpdate(roomId);
    });

    // 一時切断
    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;

      if (playerId) {
        connectionManager.disconnect(playerId, socket);
      }

      const roomId = socket.data.roomId;

      if (!playerId || !roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.players.find((p: any) => p.id === playerId);
      if (!player) return;

      // 現在の接続でなければ無視（古い接続）
      if (!connectionManager.isCurrentSocket(playerId, socket)) {
        return;
      }

      // 一時切断フラグ
      player.isDisconnected = true;
      // 🔥 ホスト切断処理（新設計）
      if (room.hostId === playerId) {
        const timeout = setTimeout(() => {
          const roomNow = roomManager.getRoom(roomId);
          if (!roomNow) return;

          const playerNow = roomNow.players.find((p: any) => p.id === playerId);

          // 復帰済みなら何もしない
          if (!playerNow || !playerNow.isDisconnected) {
            return;
          }

          roomManager.deleteRoom(roomId);
          io.to(roomId).emit('roomClosed');
        }, 10000);

        roomManager.setDisconnectTimeout?.(roomId, playerId, timeout);
        return;
      }

      // 🔥 通常プレイヤー切断処理
      const timeout = setTimeout(() => {
        const roomNow = roomManager.getRoom(roomId);
        if (!roomNow) return;

        const playerNow = roomNow.players.find((p: any) => p.id === playerId);

        // 復帰済みなら何もしない
        if (!playerNow || !playerNow.isDisconnected) {
          return;
        }

        roomManager.leaveRoom(roomId, playerId);

        const updatedRoom = roomManager.getRoom(roomId);

        if (!updatedRoom || updatedRoom.players.length === 0) {
          roomManager.deleteRoom(roomId);
          io.to(roomId).emit('roomClosed');
          return;
        }

        if (updatedRoom.hostId === playerId) {
          roomManager.deleteRoom(roomId);
          io.to(roomId).emit('roomClosed');
          return;
        }

        emitRoomUpdate(roomId);
      }, 5000);

      roomManager.setDisconnectTimeout?.(roomId, playerId, timeout);
    });
  });
}

// server/src/socket/socketServer.ts
import { Server } from 'socket.io';
import { roomManager } from '../room/RoomManager';
import { SystemError } from 'shared/types';
import { getGameDefinition } from '@core-server/gameRegistry';

export function createSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // 🔥 DEBUG: global socket tracking (playerId -> Set<socketId>)
  const playerSockets = new Map<string, Set<string>>();

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

  io.on('connection', (socket) => {
    // 🔥 接続時に復帰処理（authベース）
    const { roomId: authRoomId, playerId: authPlayerId } =
      socket.handshake.auth || {};

    if (authRoomId && authPlayerId) {
      const room = roomManager.getRoom(authRoomId);
      const player = room?.players.find((p: any) => p.id === authPlayerId);

      if (room && player) {
        socket.join(authRoomId); // ⭐ これ絶対必要

        const wasDisconnected = player.isDisconnected;

        player.socketId = socket.id;
        player.isDisconnected = false;

        if (wasDisconnected) {
          if (!room.gameType) {
            emitRoomUpdate(authRoomId);
          } else {
            const state = room.gameState;

            if (state) {
              socket.emit('gameStateUpdate', state);
            }
          }

          // 🔥 reconnect時もroom状態を同期
          emitRoomUpdate(authRoomId);
        }

        // 🔥 socketにplayer情報を保持
        socket.data.playerId = authPlayerId;
        socket.data.roomId = authRoomId;

        // 🔥 DEBUG: register socket for player (reconnect path)
        if (!playerSockets.has(authPlayerId)) {
          playerSockets.set(authPlayerId, new Set());
        }
        playerSockets.get(authPlayerId)!.add(socket.id);

        // 🔥 reconnect時：削除タイマーキャンセル
        roomManager.clearDisconnectTimeout?.(authRoomId, authPlayerId);
      }
    }

    // ルーム参加
    socket.on('joinRoom', ({ roomId, playerId, name }) => {
      if (!name) return;

      // 🔥 join時：削除タイマーキャンセル（再接続対応）
      roomManager.clearDisconnectTimeout?.(roomId, playerId);

      let room = roomManager.getRoom(roomId);

      if (!room) {
        room = roomManager.createRoom(roomId, playerId, socket.id, name);
      } else {
        const existingPlayer = room.players.find((p: any) => p.id === playerId);

        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.isDisconnected = false;
        } else {
          roomManager.joinRoom(roomId, playerId, socket.id, name);
        }
      }

      // socket情報更新
      socket.data.playerId = playerId;
      socket.data.roomId = roomId;

      // 🔥 DEBUG: register socket for player (join path)
      if (!playerSockets.has(playerId)) {
        playerSockets.set(playerId, new Set());
      }
      playerSockets.get(playerId)!.add(socket.id);

      socket.join(roomId);

      room.status = 'waiting';

      // 🔥 join時に全員へroom状態を通知
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

        io.to(roomId).emit('gameStateUpdate', newState);
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

        io.to(roomId).emit('gameStarted', initialState);
        io.to(roomId).emit('gameStateUpdate', initialState);
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

        io.to(roomId).emit('gameStarted', initialState);
        io.to(roomId).emit('gameStateUpdate', initialState);
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

        // 🔥 これが超重要
        io.to(roomId).emit('gameStateUpdate', null);

        emitRoomUpdate(roomId);
      } catch (err) {
        console.error('resetGame failed', err);
      }
    });

    // 一時切断
    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;

      // 🔥 DEBUG: unregister socket from global map
      if (playerId && playerSockets.has(playerId)) {
        playerSockets.get(playerId)!.delete(socket.id);
        if (playerSockets.get(playerId)!.size === 0) {
          playerSockets.delete(playerId);
        }
      }

      const roomId = socket.data.roomId;

      if (!playerId || !roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.players.find((p: any) => p.id === playerId);
      if (!player) return;

      // socket不一致なら無視（古い接続）
      if (player.socketId !== socket.id) {
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

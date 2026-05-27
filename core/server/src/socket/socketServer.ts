import { Server, Socket } from 'socket.io';
import { roomManager } from '../room/RoomManager';
import { connectionManager } from '../connection/ConnectionManager';
import { BaseError, SystemError, Player, Room } from 'shared/types';
import { getGameDefinition } from '@core-server/gameRegistry';
import { ErrorManager } from '../Error/ErrorManager';

// 短いIDを生成するための処理
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

  // IDの取得
  const checkHasRoomIdAndPlayerID = (socket: Socket) => {
    // socketにあるデータからroomIdとplayerIdを取得
    const roomId = socket.data.roomId;
    const playerId = socket.data.playerId;

    // roomIdが存在しないとシステムが崩壊するので、セッションを完全破棄する
    if (!roomId) {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: 'socketにroomIdが存在しません',
        recovery: ['session_cleanup'],
      });
    }
    // playerIdが存在しないということはそのセッションにいないので、プレイヤーを削除
    if (!playerId) {
      throw new SystemError({
        code: 'PLAYER_NOT_FOUND',
        message: 'socketにplayerIdが存在しません',
        recovery: ['player_delete'],
      });
    }

    return {
      roomId,
      playerId,
    };
  };

  // ルーム検索
  // 複数箇所で行うため、必要なルームの検索とない場合のエラー吐き出しをまとめる
  const findRoom = (roomId: string) => {
    const room = roomManager.getRoom(roomId);

    if (!room) {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: `このルームを見つけることができませんでした: ${roomId}`,
        recovery: [],
      });
    }

    return room;
  };

  // プレイヤーの検索
  // これもルーム検索と同様の理由
  const findPlayer = (room: Room, playerId: string) => {
    const player = room.players.find((p: Player) => p.id === playerId);

    if (!player) {
      throw new SystemError({
        code: 'PLAYER_NOT_FOUND',
        message: 'プレイヤーが見つかりません',
        recovery: [],
      });
    }

    return player;
  };

  // 🔥 共通: roomUpdate emit helper
  const emitRoomUpdate = (roomId: string) => {
    const room = findRoom(roomId);

    io.to(roomId).emit('roomUpdate', {
      ...room,
    });
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
      room.players.forEach((p: Player) => {
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
      const room = findRoom(authRoomId);
      const player = findPlayer(room, authPlayerId);

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

    const safeOn = (event: string, handler: (...args: any[]) => void) => {
      socket.on(event, (...args: any[]) => {
        try {
          handler(...args);
        } catch (err) {
          socket.emit('announce_error', ErrorManager.capture(err));
        }
      });
    };

    // ルームを新規作成
    safeOn('createRoom', ({ playerId, name }) => {
      if (!name) {
        throw new SystemError({
          code: 'NAME_NOT_FOUND',
          message: '名前がクライアントから送られてきていないです',
          recovery: [],
        });
      }

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
    safeOn('joinRoom', ({ roomId, playerId, name }) => {
      if (!name) {
        throw new SystemError({
          code: 'NAME_NOT_FOUND',
          message: '名前がクライアントから送られてきていないです',
          recovery: [],
        });
      }
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
    safeOn('leaveRoom', () => {
      const { roomId, playerId } = checkHasRoomIdAndPlayerID(socket);

      // reconnect猶予タイマーを削除
      roomManager.clearDisconnectTimeout?.(roomId, playerId);

      // socket接続解除
      connectionManager.disconnect(playerId, socket);

      // roomからプレイヤー削除
      roomManager.leaveRoom(roomId, playerId);

      // socket room離脱
      socket.leave(roomId);

      const updatedRoom = findRoom(roomId);

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
    safeOn('action', (action) => {
      const { roomId } = checkHasRoomIdAndPlayerID(socket);

      const room = findRoom(roomId);

      if (!room.gameType) {
        throw new SystemError({
          code: 'GAME_NOT_INITIALIZED',
          message: 'ゲームが選択されていません',
          recovery: ['room_delete'],
        });
      }

      const engine = getGameDefinition(room.gameType).engine;

      // 🔥 初期化（初回のみ）
      if (!room.gameState) {
        throw new SystemError({
          code: 'GAME_NOT_STARTED',
          message: 'ゲームが開始されていません',
          recovery: ['restore_snapshot'],
        });
      }

      const enrichedAction = {
        ...action,
        timestamp: Date.now(),
      };

      room.actionLogs.push(enrichedAction);

      const newState = engine.handleAction(
        room.gameState,
        enrichedAction,
        room.gameConfig,
      );

      room.gameState = newState;

      emitGameState(room, newState, 'gameStateUpdate', engine);
    });

    // ゲームを選択
    safeOn('selectGame', ({ roomId, gameType }) => {
      const room = findRoom(roomId);

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
    safeOn('startGame', ({ roomId, gameType, config }) => {
      const room = findRoom(roomId);

      if (!gameType) {
        throw new SystemError({
          code: 'GAME_NOT_INITIALIZED',
          message: 'ゲームが選択されていません',
          recovery: ['room_delete'],
        });
      }

      // ゲーム設定
      room.gameType = gameType;
      room.gameConfig = config ?? {};

      const initialState = initializeGame(room);

      emitRoomUpdate(roomId);

      const engine = getGameDefinition(gameType).engine;

      emitGameState(room, initialState, 'gameStarted', engine);
      emitGameState(room, initialState, 'gameStateUpdate', engine);
    });

    // 🔁 リマッチ（同じ設定で再プレイ）
    safeOn('rematch', ({ roomId }) => {
      const room = findRoom(roomId);
      if (!room.gameType) {
        throw new SystemError({
          code: 'GAME_NOT_INITIALIZED',
          message: 'ゲームが選択されていません',
          recovery: ['room_delete'],
        });
      }

      const initialState = initializeGame(room);

      emitRoomUpdate(roomId);

      const engine = getGameDefinition(room.gameType!).engine;

      emitGameState(room, initialState, 'gameStarted', engine);
      emitGameState(room, initialState, 'gameStateUpdate', engine);
    });

    // ⚙️ 設定画面に戻る
    safeOn('backToConfig', ({ roomId }) => {
      const room = findRoom(roomId);

      room.gameState = null;
      room.gameConfig = null;
      room.actionLogs = [];

      room.status = 'gameWaiting';

      io.to(roomId).emit('gameStateUpdate', null);

      emitRoomUpdate(roomId);
    });

    // ゲームリセット
    safeOn('resetGame', ({ roomId }) => {
      const room = findRoom(roomId);

      if (!room.gameType) {
        throw new SystemError({
          code: 'GAME_NOT_INITIALIZED',
          message: 'ゲームが選択されていません',
          recovery: ['room_delete'],
        });
      }

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
    });

    // アセットロードの状態通知
    safeOn('assetLoaded', () => {
      const { roomId, playerId } = checkHasRoomIdAndPlayerID(socket);

      const room = findRoom(roomId);
      const player = findPlayer(room, playerId);

      player.isAssetReady = true;

      emitRoomUpdate(roomId);
    });

    // 一時切断
    safeOn('disconnect', () => {
      const { roomId, playerId } = checkHasRoomIdAndPlayerID(socket);

      if (playerId) {
        connectionManager.disconnect(playerId, socket);
      }

      const room = findRoom(roomId);
      const player = findPlayer(room, playerId);

      // 現在の接続でなければ無視（古い接続）
      if (!connectionManager.isCurrentSocket(playerId, socket)) {
        return;
      }

      // 一時切断フラグ
      player.isDisconnected = true;
      // 🔥 ホスト切断処理（新設計）
      if (room.hostId === playerId) {
        const timeout = setTimeout(() => {
          const roomNow = findRoom(roomId);

          const playerNow = findPlayer(roomNow, playerId);

          // 復帰済みなら何もしない
          if (!playerNow.isDisconnected) {
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
        const roomNow = findRoom(roomId);

        const playerNow = findPlayer(roomNow, playerId);

        // 復帰済みなら何もしない
        if (!playerNow.isDisconnected) {
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

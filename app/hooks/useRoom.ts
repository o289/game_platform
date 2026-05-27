import { useCallback, useEffect, useState } from 'react';
import { GameType, Room, UIErrorResponse, SystemError } from 'shared/types';
import { socketClient } from '@core-client/services/socketClient';
import { useRoomContext } from '@core-client/context/RoomContext';
import { ErrorManager } from '@core-server/Error/ErrorManager';
// シンプルなID生成（後で差し替え可能）
const generateId = () => Math.random().toString(36).slice(2, 10);

export function useRoom(name: string) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const {
    room,
    setRoom,
    setGameState,
    setMyPlayerId,
    currentRoomId,
    setCurrentRoomId,
    error,
    setError,
  } = useRoomContext();

  const isCurrentRoom = room?.id != null && currentRoomId === room.id;

  const hostId = room?.hostId ?? null;
  const players = room?.players ?? [];
  const isHost = room?.hostId === playerId;
  const status = room?.status ?? 'init';

  const checkValidateNameLength = () => {
    if (!name || name.trim().length === 0) {
      throw new SystemError({
        code: 'NAME_VALIDATION_ERROR',
        message: '1文字以上入力してください',
        recovery: [],
      });
    }
  };

  const safeAction = (handler: () => void) => {
    try {
      handler();
    } catch (err) {
      const error = ErrorManager.capture(err);
      setError(error);
    }
  };

  useEffect(() => {
    socketClient.onAnnounceError((err: UIErrorResponse) => {
      setError(err);
    });

    return () => {
      socketClient.offAnnounceError();
    };
  }, []);

  const onClearAnnounce = () => {
    setError(null);
  };

  const onCreateRoom = useCallback(() => {
    safeAction(() => {
      checkValidateNameLength();

      sessionStorage.setItem('name', name);

      const newPlayerId = generateId();

      setPlayerId(newPlayerId);
      setMyPlayerId(newPlayerId);

      sessionStorage.setItem('playerId', newPlayerId);

      socketClient.createRoom(newPlayerId, name);
    });
  }, [name]);

  const onJoinRoom = useCallback(
    (roomId: string) => {
      safeAction(() => {
        checkValidateNameLength();

        if (!roomId) {
          throw new SystemError({
            code: 'ROOM_ID_NOT_FOUND',
            message: 'ルームIDが含まれていないため、部屋に参加できません',
            recovery: [],
          });
        }

        const normalizedRoomId = roomId.trim().toUpperCase();

        const newPlayerId = generateId();

        sessionStorage.setItem('name', name);
        sessionStorage.setItem('roomId', normalizedRoomId);
        sessionStorage.setItem('playerId', newPlayerId);

        setRoomId(normalizedRoomId);
        setPlayerId(newPlayerId);
        setMyPlayerId(newPlayerId);

        socketClient.joinRoom(normalizedRoomId, newPlayerId, name);
        setCurrentRoomId(normalizedRoomId);
      });
    },
    [name],
  );

  useEffect(() => {
    safeAction(() => {
      const savedRoomId = sessionStorage.getItem('roomId');
      const savedPlayerId = sessionStorage.getItem('playerId');
      const savedName = sessionStorage.getItem('name');

      // エラーを導入すると、部屋新規作成時にエラーが出るため対策を考えてから導入
      if (!savedRoomId || !savedPlayerId || !savedName) return;

      socketClient.connect({ roomId: savedRoomId, playerId: savedPlayerId });

      setRoomId(savedRoomId);
      setPlayerId(savedPlayerId);
      setMyPlayerId(savedPlayerId);
      setCurrentRoomId(savedRoomId);
    });
  }, []);

  const onLeaveRoom = () => {
    safeAction(() => {
      if (!roomId) {
        throw new SystemError({
          code: 'ROOM_ID_NOT_FOUND',
          message: 'ルームIDが含まれていないため、部屋から退出できません',
          recovery: [],
        });
      }

      if (!playerId) {
        throw new SystemError({
          code: 'ROOM_ID_NOT_FOUND',
          message: 'プレイヤーIDが含まれていないため、部屋から退出できません',
          recovery: [],
        });
      }

      socketClient.leaveRoom();

      sessionStorage.removeItem('roomId');
      sessionStorage.removeItem('playerId');
      sessionStorage.removeItem('name');

      setRoomId(null);
      setPlayerId(null);
      setCurrentRoomId(null);
    });
  };

  const onSelectGame = (gameId: GameType) => {
    safeAction(() => {
      if (!roomId) {
        throw new SystemError({
          code: 'ROOM_ID_NOT_FOUND',
          message: 'ルームIDが含まれていないため、部屋から退出できません',
          recovery: [],
        });
      }
      socketClient.selectGame(roomId, gameId);
    });
  };

  useEffect(() => {
    // --- Room updates ---
    socketClient.on('roomUpdate', (payload: any) => {
      setRoom((prev) => {
        if (!prev) {
          return {
            id: payload.id ?? '',
            hostId: payload.hostId,
            players: payload.players,
            status: payload.status,
            gameType: payload.gameType ?? null,
            gameState: null,
            gameConfig: null,
          } as Room;
        }

        return {
          ...prev,
          id: payload.id ?? prev.id,
          players: payload.players,
          hostId: payload.hostId,
          status: payload.status,
          gameType: payload.gameType ?? prev.gameType ?? null,
        } as Room;
      });
    });

    // --- Room created ---
    socketClient.on('roomCreated', (payload: any) => {
      setRoomId(payload.roomId);
      setCurrentRoomId(payload.roomId);

      sessionStorage.setItem('roomId', payload.roomId);
    });

    // --- Game started ---
    socketClient.on('gameStarted', (state: any) => {
      setGameState(state);
      setRoom((prev) =>
        prev ? { ...prev, status: 'playing', gameState: state } : prev,
      );
    });

    // --- Game state updates ---
    socketClient.on('gameStateUpdate', (state: any) => {
      setGameState(state);
      setRoom((prev) => (prev ? { ...prev, gameState: state } : prev));
    });

    // --- Game selected ---
    socketClient.on('gameSelected', (data: any) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              gameType: data.gameType,
              status: 'gameWaiting',
            }
          : prev,
      );
    });

    socketClient.on('leftRoom', () => {
      setCurrentRoomId(null);
      setRoom(null);
      setGameState(null);
    });

    return () => {
      socketClient.off('roomCreated');
      socketClient.off('roomUpdate');
      socketClient.off('gameStarted');
      socketClient.off('gameStateUpdate');
      socketClient.off('gameSelected');
      socketClient.off('leftRoom');
    };
  }, []);

  if (!room) {
    return {
      roomId: null,
      playerId: null,
      hostId: null,
      players: [],
      isHost: false,
      status: 'init',
      isCurrentRoom: false,
      error,
      onClearAnnounce,
      onCreateRoom,
      onJoinRoom,
      onLeaveRoom,
      onSelectGame,
    };
  }
  return {
    roomId,
    playerId,
    hostId,
    players,
    isHost,
    status,
    error,
    onClearAnnounce,
    isCurrentRoom,
    onCreateRoom,
    onJoinRoom,
    onLeaveRoom,
    onSelectGame,
  };
}

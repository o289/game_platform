import { useCallback, useEffect, useState } from 'react';
import { GameType, Room } from 'shared/types';
import { socketClient } from '@core-client/services/socketClient';
import { useRoomContext } from '@core-client/context/RoomContext';

// シンプルなID生成（後で差し替え可能）
const generateId = () => Math.random().toString(36).slice(2, 10);

function generateRoomId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export function useRoom(name: string) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  const {
    room,
    setRoom,
    setGameState,
    setMyPlayerId,
    currentRoomId,
    setCurrentRoomId,
  } = useRoomContext();

  const isCurrentRoom = room?.id != null && currentRoomId === room.id;

  const hostId = room?.hostId ?? null;
  const players = room?.players ?? [];
  const isHost = room?.hostId === playerId;
  const status = room?.status ?? 'init';

  const onCreateRoom = useCallback(() => {
    if (!name || name.trim().length === 0) return;

    sessionStorage.setItem('name', name);

    const newRoomId = generateRoomId();
    const newPlayerId = generateId();

    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setMyPlayerId(newPlayerId);

    sessionStorage.setItem('roomId', newRoomId);
    sessionStorage.setItem('playerId', newPlayerId);

    socketClient.joinRoom(newRoomId, newPlayerId, name);
    setCurrentRoomId(newRoomId);
  }, [name]);

  const onJoinRoom = useCallback(
    (roomId: string) => {
      if (!name || name.trim().length === 0) return;

      if (!roomId) return;

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
    },
    [name],
  );

  useEffect(() => {
    const savedRoomId = sessionStorage.getItem('roomId');
    const savedPlayerId = sessionStorage.getItem('playerId');
    const savedName = sessionStorage.getItem('name');

    if (!savedRoomId || !savedPlayerId || !savedName) return;

    socketClient.joinRoom(savedRoomId, savedPlayerId, savedName); // ← 追加

    setRoomId(savedRoomId);
    setPlayerId(savedPlayerId);
    setMyPlayerId(savedPlayerId);
    setCurrentRoomId(savedRoomId);
  }, []);

  const onLeaveRoom = () => {
    if (!roomId || !playerId) return;
    socketClient.leaveRoom();

    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('name');

    setRoomId(null);
    setPlayerId(null);
    setSocketId(null);
    setCurrentRoomId(null);
  };

  const onSelectGame = (gameId: GameType) => {
    if (!roomId) return;

    socketClient.selectGame(roomId, gameId);
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
      socketId: null,
      hostId: null,
      players: [],
      isHost: false,
      status: 'init',
      isCurrentRoom: false,
      onCreateRoom,
      onJoinRoom,
      onLeaveRoom,
      onSelectGame,
    };
  }
  return {
    roomId,
    playerId,
    socketId,
    hostId,
    players,
    isHost,
    status,
    isCurrentRoom,
    onCreateRoom,
    onJoinRoom,
    onLeaveRoom,
    onSelectGame,
  };
}

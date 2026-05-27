import React, { createContext, useContext, useMemo, useState } from 'react';
import { Room, UIErrorResponse } from 'shared/types';

type RoomContextType = {
  room: Room | null;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;

  gameState: unknown;
  setGameState: React.Dispatch<React.SetStateAction<any>>;

  myPlayerId: string;
  setMyPlayerId: React.Dispatch<React.SetStateAction<string>>;

  // 🔥 追加（クライアント状態）
  currentRoomId: string | null;
  setCurrentRoomId: React.Dispatch<React.SetStateAction<string | null>>;

  // エラー管理
  error: UIErrorResponse | null;
  setError: React.Dispatch<React.SetStateAction<UIErrorResponse | null>>;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error('useRoomContext must be used within RoomProvider');
  }
  return ctx;
}

// --- Provider ---

type Props = {
  children: React.ReactNode;
};

export function RoomProvider({ children }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [error, setError] = useState<UIErrorResponse | null>(null);

  const value = useMemo(
    () => ({
      room,
      setRoom,
      gameState,
      setGameState,
      myPlayerId,
      setMyPlayerId,
      currentRoomId,
      setCurrentRoomId,
      error,
      setError,
    }),
    [room, gameState, myPlayerId, currentRoomId, error],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

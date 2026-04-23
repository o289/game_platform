import React, { createContext, useContext, useMemo, useState } from 'react';
import { Room } from 'shared/types';

type RoomContextType = {
  room: Room | null;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;

  gameState: unknown;
  setGameState: React.Dispatch<React.SetStateAction<any>>;

  myPlayerId: string;
  setMyPlayerId: React.Dispatch<React.SetStateAction<string>>;
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

  const value = useMemo(
    () => ({
      room,
      setRoom,
      gameState,
      setGameState,
      myPlayerId,
      setMyPlayerId,
    }),
    [room, gameState, myPlayerId],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

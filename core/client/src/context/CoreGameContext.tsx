import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useRoomContext } from '@core-client/context/RoomContext';
import { socketClient } from '@core-client/services/socketClient';
import { Action } from '../../../../core/shared/types';

type CoreGameContextType<TState, TAction> = {
  gameState: TState | null;
  setGameState: React.Dispatch<React.SetStateAction<TState | null>>;

  myPlayerId: string;
  roomId: string;
  hostId: string;

  isMyTurn: boolean;
  isHost: boolean;

  startGame: (config: any) => void;
  rematch: () => void;
  backToConfig: () => void;
  resetGame: () => void;
  sendAction: (action: TAction) => void;
};

const CoreGameContext = createContext<CoreGameContextType<any, any> | null>(
  null,
);

type Props = {
  children: ReactNode;
};

type BaseGameState = {
  currentPlayer: string;
};

export const CoreGameProvider = <
  TState extends BaseGameState,
  TAction extends Action,
>({
  children,
}: Props) => {
  const { room, gameState, setGameState, myPlayerId } = useRoomContext();

  const state = gameState as TState | null;

  const roomId = room?.id ?? '';
  const hostId = room?.hostId ?? '';

  const isMyTurn = useMemo(() => {
    if (!state || !('currentPlayer' in state)) return false;
    return (state as any).currentPlayer === myPlayerId;
  }, [state, myPlayerId]);

  const isHost = hostId === myPlayerId;

  // ゲーム関連
  const startGame = (config: any) => {
    if (!room || !room.id || !room.gameType) return;
    socketClient.startGame(room.id, room.gameType, config);
  };

  const sendAction = (action: TAction) => {
    socketClient.sendAction(action);
  };

  const rematch = () => {
    socketClient.rematch(roomId);
  };

  const backToConfig = () => {
    socketClient.backToConfig(roomId);
  };

  const resetGame = () => {
    socketClient.resetGame(roomId);
  };

  return (
    <CoreGameContext.Provider
      value={{
        gameState: state,
        setGameState,
        myPlayerId,
        roomId,
        hostId,
        isMyTurn,
        isHost,
        startGame,
        rematch,
        backToConfig,
        resetGame,
        sendAction,
      }}
    >
      {children}
    </CoreGameContext.Provider>
  );
};

export const useCoreGame = <TState, TAction>() => {
  const ctx = useContext(CoreGameContext);
  if (!ctx) {
    throw new Error('useCoreGame must be used within CoreGameProvider');
  }
  return ctx as CoreGameContextType<TState, TAction>;
};

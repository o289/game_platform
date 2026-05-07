import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useCoreGame } from '@core-client/context';
import { Flip7State, Player, GameAction } from '../../shared/types';

type GameContextValue = {
  state: Flip7State | null;
  isMyTurn: boolean;
  isHost: boolean;

  myPlayer?: Player;

  startGame: (config: any) => void;
  resetGame: () => void;
  sendAction: (action: GameAction) => void;
  error: string | null;
};

const GameContext = createContext<GameContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
};

export const GameProvider = ({ children }: Props) => {
  const {
    gameState,
    myPlayerId,
    isMyTurn,
    isHost,
    startGame,
    resetGame,
    sendAction,
    error,
  } = useCoreGame<Flip7State, GameAction>();
  const state = gameState as Flip7State | null;

  const myPlayer = useMemo(() => {
    if (!state || !myPlayerId) return undefined;
    return state.players.find((p) => p.id === myPlayerId);
  }, [state, myPlayerId]);

  return (
    <GameContext.Provider
      value={{
        state,
        myPlayer,
        isMyTurn,
        isHost,
        startGame,
        resetGame,
        sendAction,
        error,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

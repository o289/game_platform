import { createContext, useContext, ReactNode, useMemo } from "react";
import { useCoreGame } from "@core-client/context";
import { __PASCAL_NAME__State, Player, GameAction } from '../../shared/types';

type GameContextValue = {
  state: __PASCAL_NAME__State | null;
  isMyTurn: boolean;
  isHost: boolean;

  myPlayer?: Player;
  
  startGame: (config: any) => void;
  resetGame: () => void;

  sendAction: (action: GameAction) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within GameProvider");
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
    sendAction
  } = useCoreGame<__PASCAL_NAME__State, GameAction>();
  const state = gameState as __PASCAL_NAME__State | null;

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
        sendAction
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

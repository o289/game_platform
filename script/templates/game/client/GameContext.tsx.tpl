import React, { createContext, useContext, ReactNode } from "react";
import { useCoreGame } from "@core-client/context";
import { Action } from "@core/shared/types";

type GameContextValue<TState, TAction> = {
  state: TState | null;
  isMyTurn: boolean;

  startGame: (config: any) => void;
  sendAction: (action: TAction) => void;
  error: string | null;
};

const GameContext = createContext<GameContextValue<any, any> | null>(null);

type Props = {
  children: ReactNode;
};

export const GameProvider = <TState, TAction extends Action>({
  children,
}: Props) => {
  const {
    gameState,
    isMyTurn,
    startGame,
    sendAction,
    error
  } = useCoreGame<TState, TAction>();

  return (
    <GameContext.Provider
      value={{
        state: gameState,
        isMyTurn,
        startGame,
        sendAction,
        error
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = <TState, TAction>() => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within GameProvider");
  }
  return ctx as GameContextValue<TState, TAction>;
};
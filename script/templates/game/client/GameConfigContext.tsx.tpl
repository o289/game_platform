

import React, { createContext, useContext, useState, useMemo } from "react";

/**
 * GameConfigContext Template
 *
 * 役割:
 * - ゲーム開始前の設定（config）を管理
 * - WaitingScreen などから更新
 * - startGame に渡すための状態
 *
 * ※ 各ゲームで型を具体化してください
 */

export type GameConfig = Record<string, any>;

type GameConfigContextValue = {
  config: GameConfig;
  setConfig: (config: GameConfig) => void;
};

const GameConfigContext = createContext<GameConfigContextValue | null>(null);

export const useGameConfig = () => {
  const ctx = useContext(GameConfigContext);
  if (!ctx) {
    throw new Error("useGameConfig must be used within GameConfigProvider");
  }
  return ctx;
};

type Props = {
  initialConfig?: GameConfig;
  children: React.ReactNode;
};

export const GameConfigProvider = ({ initialConfig = {}, children }: Props) => {
  const [config, setConfig] = useState<GameConfig>(initialConfig);

  const value = useMemo(
    () => ({ config, setConfig }),
    [config]
  );

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
};
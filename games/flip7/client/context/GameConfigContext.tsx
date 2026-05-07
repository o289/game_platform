import React, { createContext, useContext, useState, useMemo } from 'react';
import { Flip7Config, defaultConfig } from 'games/flip7/shared/types';

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

export type GameConfig = Flip7Config;

type GameConfigContextValue = {
  config: GameConfig;
  setConfig: (partial: Partial<GameConfig>) => void;

  // helpers
  setTargetScore: (score: number) => void;
  setFlip7Bonus: (bonus: number) => void;
};

const GameConfigContext = createContext<GameConfigContextValue | null>(null);

export const useGameConfig = () => {
  const ctx = useContext(GameConfigContext);
  if (!ctx) {
    throw new Error('useGameConfig must be used within GameConfigProvider');
  }
  return ctx;
};

type Props = {
  children: React.ReactNode;
};

export const GameConfigProvider = ({ children }: Props) => {
  const [config, setConfigState] = useState<GameConfig>(defaultConfig);

  const setConfig = (partial: Partial<GameConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const setTargetScore = (score: number) => {
    setConfig({ targetScore: score });
  };

  const setFlip7Bonus = (bonus: number) => {
    setConfig({ flip7Bonus: bonus });
  };

  const value = useMemo(
    () => ({ config, setConfig, setTargetScore, setFlip7Bonus }),
    [config],
  );

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
};

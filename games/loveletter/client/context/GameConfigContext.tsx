import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  LoveletterConfig,
  defaultConfig,
  allCards,
} from 'games/loveletter/shared/types';

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

export type GameConfig = LoveletterConfig;

type GameConfigContextValue = {
  config: GameConfig;
  setConfig: (partial: Partial<GameConfig>) => void;

  // helper
  setWinPoint: (point: number) => void;
  setBonusForValue8: (bonus: number) => void;
  toggleCard: (type: GameConfig['enabledCards'][number]['type']) => void;
};

const GameConfigContext = createContext<GameConfigContextValue | null>(null);

export const useGameConfig = () => {
  const ctx = useContext(GameConfigContext);
  if (!ctx) {
    throw new Error('useGameConfig must be used within GameConfigProvider');
  }
  return ctx;
};

export const GameConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<GameConfig>(defaultConfig);

  const setConfig = (partial: Partial<GameConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const setWinPoint = (point: number) => {
    setConfig({ winPoints: point });
  };

  const setBonusForValue8 = (bonus: number) => {
    setConfig({ bonusForValue8: bonus });
  };

  const toggleCard = (type: GameConfig['enabledCards'][number]['type']) => {
    setConfigState((prev) => {
      const defaultCard = allCards.find((c) => c.type === type);
      if (!defaultCard) return prev;

      return {
        ...prev,
        enabledCards: prev.enabledCards.map((c) =>
          c.type === type
            ? { ...c, count: c.count > 0 ? 0 : defaultCard.count }
            : c,
        ),
      };
    });
  };

  const value = useMemo(
    () => ({
      config,
      setConfig,
      setBonusForValue8,
      setWinPoint,
      toggleCard,
    }),
    [config],
  );

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
};

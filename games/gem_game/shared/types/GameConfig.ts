import { WinCondition } from './GameState';

// shared/src/types/GemGameConfig.ts
export type DeckConfig = {
  level1Count: number; // 40, 50, 60, 70, 100
};

export type TokenConfig = {
  goldCount: number; // 3, 5, 7
};

export type GemGameConfig = {
  winCondition: WinCondition;
  deck: DeckConfig;
  token: TokenConfig;
};

export const defaultGemGameConfig: GemGameConfig = {
  winCondition: {
    type: 'points',
    target: 15, // 10, 15, 20, 25, 30, 40
  },

  deck: {
    level1Count: 40,
  },

  token: {
    goldCount: 5,
  },
};

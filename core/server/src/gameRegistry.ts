import type { GameEngine } from '@core-server/engine/GameEngine';
import type { GAMES, GameType } from '../../shared/types/Game';
import { Action } from '../../shared/types';

import fs from 'fs';
import path from 'path';

export type GameDefinition<
  TState = any,
  TAction extends Action = Action,
  TConfig = any,
> = {
  component: React.ComponentType<any>;
  engine: GameEngine<TState, TAction, TConfig>;
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
};

// GAMESベースで動的ロード（型安全）
export const gameRegistry: Record<GameType, GameDefinition> = {} as any;

GAMES.forEach((game) => {
  const entryPath = path.join(process.cwd(), 'games', game.id, 'index.ts');

  if (fs.existsSync(entryPath)) {
    try {
      const mod = require(entryPath);

      if (mod.definition) {
        gameRegistry[game.id] = mod.definition;
      } else {
        throw new Error(`Game ${game.id} has no definition export`);
      }
    } catch (e) {
      console.error(`Failed to load game: ${game.id}`, e);
    }
  } else {
    console.warn(`Game entry not found: ${game.id}`);
  }
});

export function getGameDefinition(gameType: GameType) {
  const def = gameRegistry[gameType];
  if (!def) {
    throw new Error(`Unknown gameType: ${gameType}`);
  }
  return def;
}

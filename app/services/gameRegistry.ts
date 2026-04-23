// core/client/gameRegistry.ts

import { GAMES } from '../../core/shared/types';

// Viteのimport.meta.globを使用してゲームを自動検出
const modules = import.meta.glob('../../games/*/index.ts');

export const clientGameRegistry = Object.fromEntries(
  GAMES.map((game) => {
    const entry = Object.entries(modules).find(([path]) =>
      path.includes(`games/${game.id}/index.ts`),
    );

    if (!entry) {
      console.warn(`Game module not found for: ${game.id}`);
      return [game.id, undefined];
    }

    const [, loader] = entry;

    return [game.id, loader];
  }),
) as Record<string, () => Promise<any>>;

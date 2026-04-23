import GemGame from './client/GemGame';
import { gemEngine } from './server/engine/gemEngine';

import { GemGameProvider } from './client/context/GameContext';
import { GemGameConfigProvider } from './client/context/GameConfigContext';

export const definition = {
  component: GemGame,
  engine: gemEngine,
  providers: [GemGameProvider, GemGameConfigProvider],
};

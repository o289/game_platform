import Loveletter from './client/Loveletter';
import { LoveletterEngine } from './server/engine/LoveletterEngine';

import { GameProvider } from './client/context/GameContext';
import { GameConfigProvider } from './client/context/GameConfigContext';

export const definition = {
  component: Loveletter,
  engine: LoveletterEngine,
  providers: [GameProvider, GameConfigProvider],
};

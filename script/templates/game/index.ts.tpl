import __PASCAL_NAME__ from "./client/__PASCAL_NAME__";
import { __PASCAL_NAME__Engine } from "./server/engine/__PASCAL_NAME__Engine";

import { GameProvider } from "./client/context/GameContext";
import { GameConfigProvider } from "./client/context/GameConfigContext";

export const definition = {
  component: __PASCAL_NAME__,
  engine: __PASCAL_NAME__Engine,
  providers: [
    GameProvider,
    GameConfigProvider
  ],
};
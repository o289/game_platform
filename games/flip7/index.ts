import Flip7 from "./client/Flip7";
import { Flip7Engine } from "./server/engine/Flip7Engine";

import { GameProvider } from "./client/context/GameContext";
import { GameConfigProvider } from "./client/context/GameConfigContext";

export const definition = {
  component: Flip7,
  engine: Flip7Engine,
  providers: [
    GameProvider,
    GameConfigProvider
  ],
};
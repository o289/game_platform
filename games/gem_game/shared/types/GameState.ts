import { Player } from './Player';
import { TokenSet } from './Tokens';
import { Card } from './Card';
import { Noble } from './Noble';

export type WinCondition =
  | {
      type: 'points';
      target: number; // 10, 15, 20, 25, 30, 40
    }
  | {
      type: 'turn_limit';
      maxTurns: number; // 20, 25, 30, 35, 40
    };

export type GemGameState = {
  players: Player[];

  tokenPool: TokenSet;

  // 山札
  decks: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };

  // ボードに配置
  market: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };

  nobles: Noble[];

  currentPlayer: string;

  roundStartPlayer: string;

  roundEndTriggered: boolean;

  turn: number;

  winCondition: WinCondition;
  winnerId?: string;
  winnerName?: string;
};

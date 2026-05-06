import { Player } from './Player';
import { Card } from './Card';

export type Phase = 'PLAYING' | 'ROUND_END' | 'GAME_END';

export type GameEvent =
  | { type: 'draw'; playerId: string; card: Card }
  | { type: 'stand'; playerId: string }
  | { type: 'bust'; playerId: string }
  | { type: 'flip7'; playerId: string }
  | { type: 'freeze'; from: string; to: string }
  | { type: 'flipThree'; playerId: string }
  | { type: 'secondChance'; playerId: string }
  | { type: 'useSecondChance'; playerId: string };

export type PendingEffect = {
  type: 'freeze' | 'flipThree';
  sourcePlayerId: string;
};

export type Flip7State = {
  players: Player[];

  currentPlayer: string;

  // 山札・捨て札
  deck: Card[];
  discardPile: Card[];

  // ラウンド管理
  round: number;

  phase: Phase;
  pendingEffect?: PendingEffect;
  events: GameEvent[];
  // 誰がFlip7したか（7種達成）1人のみ
  flip7PlayerId?: string;
  // ゲーム終了
  winnerIds?: string[];
};

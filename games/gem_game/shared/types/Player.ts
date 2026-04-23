import { TokenSet, BonusSet } from './Tokens';
import { Card } from './Card';

export type Player = {
  id: string;

  name: string;

  tokens: TokenSet;

  bonuses: BonusSet;

  reservedCards: Card[];

  cards: Card[];

  point: number;
};

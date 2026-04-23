import { Color, TokenSet } from './Tokens';
import { Card } from './Card';

export type buyCardSource = 'market' | 'reserved';

export type ActionState =
  | { type: 'none' }
  | { type: 'card_selected'; card: Card; source: buyCardSource }
  | { type: 'payment_selecting'; card: Card; source: buyCardSource }
  | { type: 'token_selecting' }
  | { type: 'deck_reserve_confirm'; level: 'level1' | 'level2' | 'level3' };

export type GemAction =
  | { type: 'TAKE_TOKENS'; payload: { tokens: Color[] } }
  | {
      type: 'RESERVE_CARD';
      payload: {
        source: 'market' | 'deck';
        cardId?: string;
        level?: 'level1' | 'level2' | 'level3';
      };
    }
  | { type: 'BUY_CARD'; payload: { cardId: string; payment?: TokenSet } };

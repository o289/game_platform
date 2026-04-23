import { CardType } from './Card';

export type GameAction =
  /**
   * 山札からカードを1枚引く
   */
  | {
      type: 'DRAW_CARD';
      payload: object;
    }

  /**
   * 手札からカードを1枚出す
   * - targetPlayerId: 対象プレイヤー（必要な場合のみ）
   * - guess?: 兵士用の推測カード
   */
  | {
      type: 'PLAY_CARD';
      payload: {
        cardType: CardType;
        targetPlayerId?: string;
        guess?: string;
      };
    };

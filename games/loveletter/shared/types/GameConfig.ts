import { CardPool } from './Card';

export const allCards: CardPool[] = [
  // 基本
  { type: 'SOLDIER', count: 5 },
  { type: 'CLOWN', count: 2 },
  { type: 'KNIGHT', count: 2 },
  { type: 'PRIEST', count: 2 },
  { type: 'WIZARD', count: 2 },
  { type: 'GENERAL', count: 1 },
  { type: 'MINISTER', count: 1 },
  { type: 'PRINCESS', count: 1 },
  // 追加
  { type: 'COMMONER', count: 1 },
  { type: 'SERVANT', count: 5 },
  { type: 'FORTUNE_TELLER', count: 2 },
  { type: 'MERCHANT', count: 2 },
  { type: 'BUTLER', count: 2 },
  { type: 'SCHOLAR', count: 2 },
  { type: 'DOG', count: 1 },
  { type: 'QUEEN_MOTHER', count: 1 },
  { type: 'MARQUISE', count: 1 },
  { type: 'COUNTESS', count: 1 },
  { type: 'PRINCESS_SECOND', count: 1 },
  { type: 'PRINCESS_THIRD', count: 1 },
  { type: 'PRINCE', count: 1 },
  { type: 'KING_FATAL', count: 1 },
];

export type LoveletterConfig = {
  /**
   * 勝利に必要なポイント
   * 例: 3点で勝利
   */
  winPoints: number;

  /**
   * 強さ8（姫・伯爵夫人など）で勝利したときのボーナス点
   * 例: 通常1点 → 2点にする
   */
  bonusForValue8: number;

  /**
   * 使用するカード一覧（追加カード含む）
   * 例: ["SOLDIER", "PRINCESS", "KING"]
   */
  enabledCards: CardPool[];
};

const BASIC_TYPES: CardPool['type'][] = [
  'SOLDIER',
  'CLOWN',
  'KNIGHT',
  'PRIEST',
  'WIZARD',
  'GENERAL',
  'MINISTER',
  'PRINCESS',
];

export const defaultConfig: LoveletterConfig = {
  winPoints: 3,
  bonusForValue8: 2,
  enabledCards: allCards.map((c) => ({
    ...c,
    count: BASIC_TYPES.includes(c.type) ? c.count : 0,
  })),
};

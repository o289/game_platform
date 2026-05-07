import { NumberCard, ScoreModifierCard } from './Card';

export type Status = 'PLAYING' | 'BUSTED' | 'STOOD';

export type Player = {
  id: string;
  name: string;
  // 累計スコア（ゲーム全体）
  totalScore: number;
  // このラウンドで確定した点数（パス時）
  roundScore: number;

  // ラウンド状態
  field: {
    numberCards: NumberCard[];
    modifiers: ScoreModifierCard[];
    secondChance: boolean;
  };

  status: Status; // 脱落 or パス
};

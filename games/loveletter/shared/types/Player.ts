import { Card } from './Card';

type BasePlayer = {
  id: string;
  name: string;
  // 捨て札（履歴）
  discardPile: Card[];
  // 脱落しているか
  isEliminated: boolean;
  eliminatedCount: number;

  // 僧侶の効果を受けているか（無敵）
  isProtected: boolean;

  // 得点
  point: number;
};

export type Player = BasePlayer & {
  // 手札（1枚のみ）
  hand: Card | null;
  // 引いたカード
  drawnCard: Card | null;
};

/**
 * プレイヤーの公開情報
 */
export type PublicPlayerState = BasePlayer & {
  // 自分のみ手札が見える（viewer依存）
  hand?: Card;
  drawnCard?: Card; // ← 追加
};

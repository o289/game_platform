import { Player, PublicPlayerState } from './Player';
import { Card, CardType } from './Card';

export const eliminatedReason: Partial<Record<CardType, string>> = {
  SOLDIER: '兵士に手札を当てられた',
  KNIGHT: '騎士の比較で負けた',
  SCHOLAR: '学者の比較で負けた',
  WIZARD: '魔術師の効果でカードを捨てさせられた',
  MINISTER: '大臣の条件を満たしたため脱落',
  PRINCESS: '姫を捨てたため脱落',
  KING_FATAL: '王を引いたため脱落',
  MERCHANT: '商人の効果で条件を満たしたため脱落',
  QUEEN_MOTHER: '王太后の条件を満たしたため脱落',
};

/**
 * 専用UIがいるものはWAIT_EFFECT
 * いらないものはRESOLVEに遷移
 */
export type Phase =
  | 'DRAW'
  | 'SELECT'
  | 'PLAY'
  | 'WAIT_EFFECT'
  | 'RESOLVE'
  | 'ROUND_END';

type BasePendingEffect = {
  resolved?: boolean;
};

type pendingEffectType =
  | (BasePendingEffect & {
      type: 'REVEAL';
      viewerId: string;
      targetId: string;
      card: Card;
    })
  | (BasePendingEffect & {
      type: 'BATTLE';
      attackerId: string;
      targetId: string;
      myCard: Card;
      targetCard: Card;
      rule: 'HIGHER_LOSES' | 'LOWER_LOSES';
      loserId?: string;
      sourceCard?: CardType; // ⭐追加
    })
  | (BasePendingEffect & {
      type: 'WIZARD';
      playerId: string;
      targetId: string;
      drawnCard?: Card;
    })
  | (BasePendingEffect & {
      type: 'EXCHANGE';
      playerId: string;
      targetId: string;
    })
  | (BasePendingEffect & {
      type: 'ELIMINATED';
      playerId: string;
      reason: string;
    })
  | (BasePendingEffect & {
      type: 'ROUND_END';
      winnerIds: string[];
      winnerName?: string[];
      reason: 'LAST_SURVIVOR' | 'HIGH_CARD';
      playerCards?: {
        playerId: string;
        card: Card;
        value: number;
      }[];
    });

type BaseLoveletterState = {
  phase: Phase;
  currentPlayer: string;
  roundStartPlayer: string;

  isGameEnded: boolean;
  turn: number;

  round: number;
  roundWinners: string[];

  point: number;
  winPointCondition: number;

  winnerId?: string;
  winnerName?: string;

  revealedCards: Card[];

  pendingEffect?: pendingEffectType;
};

export type LoveletterState = BaseLoveletterState & {
  players: Player[];
  // 山札
  deck: Card[];
  // ゲーム開始時に除外したカード
  hiddenCard: Card | null;
};

/**
 * クライアントに送るための公開用State
 * - 非公開情報（deck, hiddenCard, 他人のhand）は含めない
 * - viewerごとにhandの見え方が変わる前提
 */
export type PublicLoveletterState = BaseLoveletterState & {
  // 公開情報
  players: PublicPlayerState[];

  // 山札は中身ではなく枚数だけ公開
  deckCount: number;
};

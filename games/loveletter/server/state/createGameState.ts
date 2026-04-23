import {
  LoveletterState,
  LoveletterConfig,
  Card,
} from 'games/loveletter/shared/types';
/**
 * カードの基本value
 */
function getBaseValue(type: Card['type']): number {
  const map: Record<string, number> = {
    SOLDIER: 1,
    CLOWN: 2,
    KNIGHT: 3,
    PRIEST: 4,
    WIZARD: 5,
    GENERAL: 6,
    MINISTER: 7,
    PRINCESS: 8,

    COMMONER: 0,
    SERVANT: 1,
    FORTUNE_TELLER: 2,
    MERCHANT: 3,
    BUTLER: 4,
    SCHOLAR: 5,
    DOG: 6,
    QUEEN_MOTHER: 7,
    MARQUISE: 7,
    COUNTESS: 8,
    PRINCESS_SECOND: 8,
    PRINCESS_THIRD: 8,
    PRINCE: 8,
    KING_FATAL: -1,
  };

  return map[type];
}

/**
 * シャッフル（Fisher-Yates）
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * デッキ生成
 */
function createDeck(config: LoveletterConfig): Card[] {
  const deck: Card[] = [];

  config.enabledCards.forEach((c: { type: Card['type']; count: number }) => {
    for (let i = 0; i < c.count; i++) {
      deck.push({
        type: c.type,
        value: getBaseValue(c.type),
      });
    }
  });

  return shuffle(deck);
}

// 初期配布NGカード
const INITIAL_EXCLUDE: Card['type'][] = ['KING_FATAL'];

function drawInitialCard(deck: Card[]): Card | null {
  for (let i = 0; i < deck.length; i++) {
    const card = deck.pop();
    if (!card) return null;

    if (!INITIAL_EXCLUDE.includes(card.type)) {
      return card;
    }

    // NGカードはデッキ下に戻す
    deck.unshift(card);
  }

  return null;
}

type State = LoveletterState;
type Config = LoveletterConfig;

type InitParams = {
  players: { id: string; name: string }[];
};

export function createGameState(params: InitParams, config: Config): State {
  const { players } = params;

  // デッキ生成
  const deck = createDeck(config);

  // hiddenCard（1枚除外）
  const hiddenCard = deck.pop() ?? null;

  // 2人用公開カード
  const revealedCards: Card[] = [];
  if (players.length === 2) {
    for (let i = 0; i < 3; i++) {
      const card = deck.pop();
      if (card) revealedCards.push(card);
    }
  }

  // プレイヤー初期化（1枚配布）
  const playerStates = players.map((p) => ({
    id: p.id,
    name: p.name,
    hand: drawInitialCard(deck),
    drawnCard: null,
    point: 0,
    discardPile: [],
    isEliminated: false,
    eliminatedCount: 0,
    isProtected: false,
  }));

  const state: State = {
    players: playerStates,
    phase: 'DRAW',
    deck,
    hiddenCard,
    revealedCards,

    currentPlayer: playerStates[0]?.id ?? '',
    roundStartPlayer: playerStates[0]?.id ?? '',

    turn: 0,

    isGameEnded: false,

    round: 1,
    roundWinners: [],

    point: 0,
    winPointCondition: config.winPoints,

    winnerId: undefined,
    winnerName: undefined,
  };

  return state;
}

/**
 * 初期化
 * 次のラウンドに必要な情報は残し、それ以外を初期化
 */
export function initNextRound(
  state: LoveletterState,
  config: LoveletterConfig,
): LoveletterState {
  // 新しいデッキ生成
  const deck = createDeck(config);

  // hiddenCard
  const hiddenCard = deck.pop() ?? null;

  // 2人用公開カード
  const revealedCards: Card[] = [];
  if (state.players.length === 2) {
    for (let i = 0; i < 3; i++) {
      const card = deck.pop();
      if (card) revealedCards.push(card);
    }
  }

  // プレイヤー状態更新（ポイントなどは維持）
  const players = state.players.map((p) => ({
    ...p,
    hand: drawInitialCard(deck),
    drawnCard: null,
    discardPile: [],
    isEliminated: false,
    isProtected: false,
  }));

  return {
    ...state,
    players,
    deck,
    hiddenCard,
    revealedCards,
    phase: 'DRAW',
    currentPlayer: state.roundStartPlayer,
    roundStartPlayer: state.roundStartPlayer,
    turn: 0,
    round: state.round + 1,
    roundWinners: [],
    isGameEnded: false,
  };
}

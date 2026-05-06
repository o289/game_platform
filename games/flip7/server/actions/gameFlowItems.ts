import getCurrentUser from '../utils/getCurrentUser';
import {
  Flip7State,
  Flip7Config,
  Player,
  NumberCard,
} from 'games/flip7/shared/types';
import { Status } from 'games/flip7/shared/types';

/* =========================
   補助関数
========================= */
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function drawFromDiscardPile(state: Flip7State) {
  let nextState = state;

  if (nextState.deck.length === 0) {
    nextState = {
      ...nextState,
      deck: shuffle(nextState.discardPile),
      discardPile: [],
    };
    return nextState;
  }

  return state;
}

/* =========================
   イベントを消費
========================= */
export function handleConsumeEvent(state: Flip7State): Flip7State {
  if (state.events.length === 0) return state;

  const nextState = state;

  nextState.events.shift();

  return nextState;
}

/* =========================
   脱落
========================= */
export function playerBust(
  state: Flip7State,
  player: Player,
  card: NumberCard,
): Flip7State {
  const players = state.players.map((p) => {
    if (p.id !== player.id) return p;

    const busted: Status = 'BUSTED';

    return {
      ...p,
      status: busted,
      roundScore: 0,
      field: {
        ...p.field,
        numberCards: [...p.field.numberCards, card],
      },
    };
  });

  return {
    ...state,
    players,
    events: [
      ...state.events,
      {
        type: 'bust',
        playerId: player.id,
      },
    ],
  };
}

/* =========================
   次のプレイヤー
========================= */
export function advanceTurn(state: Flip7State): Flip7State {
  const currentPlayer = getCurrentUser(state);
  const playerCount = state.players.length;

  const currentIndex = state.players.findIndex(
    (p) => p.id === currentPlayer.id,
  );

  if (currentIndex === -1) return state;

  for (let i = 1; i <= playerCount; i++) {
    const nextIndex = (currentIndex + i) % playerCount;
    const nextPlayer = state.players[nextIndex];

    if (nextPlayer.status === 'PLAYING') {
      state.currentPlayer = nextPlayer.id;
      return state;
    }
  }

  return state;
}

/* =========================
   スコア計算
========================= */
export function calculateScore(
  player: Player,
  state: Flip7State,
  config: Flip7Config,
): number {
  const sum = player.field.numberCards.reduce((acc, c) => acc + c.value, 0);

  const hasMultiplier = player.field.modifiers.some(
    (m) => m.kind === 'multiply',
  );

  const addSum = player.field.modifiers
    .filter((m) => m.kind === 'add')
    .reduce((acc, m) => acc + m.value, 0);

  let score = sum;

  if (hasMultiplier) {
    score *= 2;
  }

  score += addSum;

  if (state.flip7PlayerId === player.id) {
    score += config.flip7Bonus;
  }

  return score;
}

/* =========================
   ラウンドスコア更新（常時再計算）
========================= */
export function updateRoundScores(
  state: Flip7State,
  config: Flip7Config,
): Flip7State {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.status === 'BUSTED') {
        return {
          ...p,
          roundScore: 0,
        };
      }

      return {
        ...p,
        roundScore: calculateScore(p, state, config),
      };
    }),
  };
}

/* =========================
   トータルスコア確定（ラウンド終了時のみ）
========================= */
export function applyTotalScores(state: Flip7State): Flip7State {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.status === 'BUSTED') {
        return {
          ...p,
          totalScore: p.totalScore,
        };
      }

      return {
        ...p,
        totalScore: p.totalScore + p.roundScore,
      };
    }),
  };
}

/* =========================
   ラウンド終了判定
========================= */
export function checkRoundEnd(state: Flip7State): boolean {
  // Flip7が発生している場合は即終了
  if (state.flip7PlayerId) {
    return true;
  }

  // 全員が PLAYING 以外かチェック
  const allFinished = state.players.every((p) => p.status !== 'PLAYING');

  return allFinished;
}

export function applyRoundEnd(state: Flip7State): Flip7State {
  return {
    ...state,
    phase: 'ROUND_END',
  };
}

/* =========================
   ゲーム終了判定
========================= */
export function checkGameEnd(state: Flip7State, config: Flip7Config): boolean {
  return state.players.some((p) => p.totalScore >= config.targetScore);
}

export function applyGameEnd(state: Flip7State, winners: string[]): Flip7State {
  return {
    ...state,
    phase: 'GAME_END',
    winnerIds: winners,
  };
}

/* =========================
   勝者判定
========================= */
export function decideWinners(state: Flip7State): string[] {
  const maxScore = Math.max(...state.players.map((p) => p.totalScore));

  return state.players
    .filter((p) => p.totalScore === maxScore)
    .map((p) => p.id);
}

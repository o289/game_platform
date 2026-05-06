import {
  Flip7State,
  Flip7Config,
  Player,
  Card,
  Phase,
} from 'games/flip7/shared/types';
import { createDeck, drawCard } from '../generation/createDeck';
/**
 * createGameState Template
 *
 * 役割:
 * - 初期GameStateを生成する
 * - init(config) から呼び出される
 *
 * ※ 各ゲームでState/Configの型を具体化してください
 */

// 仮の型（各ゲームで置き換える）
type State = Flip7State;
type Config = Flip7Config;

type InitParams = {
  players: { id: string; name: string }[];
};

function applyCardToPlayer(player: Player, card: Card) {
  switch (card.type) {
    case 'number':
      player.field.numberCards.push(card);
      break;

    case 'modifier':
      player.field.modifiers.push(card);
      break;

    case 'action':
      if (card.kind === 'secondChance') {
        player.field.secondChance = true;
      }
      // 初期配布では freeze / flipThree は無視 or 別処理
      break;
  }
}

function dealInitialCards(players: Player[], deck: Card[]) {
  for (const player of players) {
    const card = drawCard(deck);
    if (!card) continue;

    applyCardToPlayer(player, card);
  }
}

export function createGameState(params: InitParams, config: Config): State {
  const { players } = params;
  if (players.length === 0) {
    throw new Error('NO_PLAYERS');
  }
  const initPlayers: Player[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    totalScore: 0,
    roundScore: 0,

    field: {
      numberCards: [],
      modifiers: [],
      secondChance: false,
    },

    status: 'PLAYING',
  }));

  // 設定
  const deck = createDeck();
  // 初期配布（各プレイヤーに1枚）
  dealInitialCards(initPlayers, deck);
  const currentPlayer = initPlayers[0].id;
  const discardPile: Card[] = [];
  const round: number = 1;
  const phase: Phase = 'PLAYING';

  // ベースの初期状態
  const baseState: State = {
    players: initPlayers,
    currentPlayer,
    deck,
    discardPile,
    round,
    phase,
    events: [],
    pendingEffect: undefined,
    flip7PlayerId: undefined,
    winnerIds: [],
  };

  return baseState;
}

/* =========================
   次ラウンド初期化
========================= */
export function initNextRound(state: Flip7State): Flip7State {
  const players: Player[] = state.players.map((p) => ({
    ...p,
    field: {
      numberCards: [],
      modifiers: [],
      secondChance: false,
    },
    status: 'PLAYING',
    roundScore: 0,
  }));

  // ⭐ 初期配布
  const deck = state.deck;
  dealInitialCards(players, deck);

  return {
    ...state,
    players,
    deck,
    flip7PlayerId: undefined,
    phase: 'PLAYING',
    events: [],
    round: state.round + 1,
  };
}

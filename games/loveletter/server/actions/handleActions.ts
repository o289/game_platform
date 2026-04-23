import { LoveletterState } from '../../shared/types';
import getCurrentUser from '../utils/getCurrentUser';
import {
  resolveDrawEffect,
  resolvePlayEffect,
  resolvePassiveEffect,
} from './resolveEffect';
import { resolveState } from './resolveState';
import { getCardValue } from './getCardValue';
import { GameError } from '../../shared/types';

export function advanceTurn(state: LoveletterState): LoveletterState {
  state.turn += 1;

  const currentIndex = state.players.findIndex(
    (p) => p.id === state.currentPlayer,
  );

  let nextIndex = (currentIndex + 1) % state.players.length;

  while (state.players[nextIndex].isEliminated) {
    nextIndex = (nextIndex + 1) % state.players.length;
  }

  state.currentPlayer = state.players[nextIndex].id;

  state.phase = 'DRAW';

  return state;
}

/**
 * アクションを処理してStateを更新
 */
export function handleDrawCard(state: LoveletterState): LoveletterState {
  const player = getCurrentUser(state);

  // ⭐ 無敵解除
  if (player.isProtected) player.isProtected = false;

  const card = state.deck.pop() ?? state.hiddenCard ?? null;

  if (card) {
    // 既にhandがある前提なので、DRAW後はdrawnCardに入れる
    player.drawnCard = card;
  }

  // ⭐ Draw時効果
  const draw = resolveDrawEffect(state);
  const passive = resolvePassiveEffect(state);
  const reason = draw?.eliminationReason ?? passive?.eliminationReason;
  if (reason) {
    state = resolveState(state, reason);
    state.phase = 'WAIT_EFFECT';
    return state;
  }

  state.phase = 'PLAY';

  return state;
}

export function handlePlayCard(
  state: LoveletterState,
  payload: any,
): LoveletterState {
  const player = getCurrentUser(state);
  const { cardType, targetPlayerId, guess } = payload;

  const hand = player.hand;
  const drawn = player.drawnCard;

  // ⭐ MARQUISE強制プレイチェック
  if (hand && drawn) {
    const total = getCardValue(hand, player) + getCardValue(drawn, player);

    const hasMarquise = hand.type === 'MARQUISE' || drawn.type === 'MARQUISE';

    if (hasMarquise && total >= 12) {
      if (cardType !== 'MARQUISE') {
        throw new GameError('FORCED_PLAY', 'MARQUISEを出す必要があります');
      }
    }
  }

  if (!player.hand) return state;

  let playedCard = null;

  if (player.hand && player.hand.type === cardType) {
    // handを出した場合
    playedCard = player.hand;
    player.hand = player.drawnCard ?? null;
    player.drawnCard = null;
  } else if (player.drawnCard && player.drawnCard.type === cardType) {
    // drawnCardを出した場合
    playedCard = player.drawnCard;
    player.drawnCard = null;
  }

  if (!playedCard) return state;

  player.discardPile.push(playedCard);

  const play = resolvePlayEffect(state, cardType, targetPlayerId, guess);
  const passive = resolvePassiveEffect(state);
  const reason = play?.eliminationReason ?? passive?.eliminationReason;
  if (reason) {
    state = resolveState(state, reason);
    state.phase = 'WAIT_EFFECT';
    return state;
  }

  if (state.pendingEffect) {
    state.phase = 'WAIT_EFFECT';
  } else {
    state.phase = 'RESOLVE';
  }

  return state;
}

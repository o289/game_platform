import {
  Flip7State,
  Player,
  NumberCard,
  ScoreModifierCard,
  ActionCard,
} from '../../shared/types';
import { drawFromDiscardPile, playerBust } from './gameFlowItems';

/* =========================
   各カード処理
========================= */

function drawNumberCard(
  state: Flip7State,
  player: Player,
  card: NumberCard,
): Flip7State {
  const exists = player.field.numberCards.some((c) => c.value === card.value);

  if (exists) {
    // セカンドチャンスがあれば回避
    if (player.field.secondChance) {
      player.field.secondChance = false;
      state.discardPile.push(card);
      state.events.push({
        type: 'useSecondChance',
        playerId: player.id,
      });
      return state;
    }

    const nextState = playerBust(state, player, card);
    return nextState;
  }

  player.field.numberCards.push(card);

  state.events.push({
    type: 'draw',
    playerId: player.id,
    card,
  });

  // Flip7チェック
  const uniqueCount = new Set(player.field.numberCards.map((c) => c.value))
    .size;

  if (uniqueCount >= 7) {
    state.flip7PlayerId = player.id;
    state.events.push({
      type: 'flip7',
      playerId: player.id,
    });
  }

  return state;
}

function drawModifierCard(
  state: Flip7State,
  player: Player,
  card: ScoreModifierCard,
): Flip7State {
  player.field.modifiers.push(card);
  state.events.push({
    type: 'draw',
    playerId: player.id,
    card,
  });
  return state;
}

function drawActionCard(
  state: Flip7State,
  player: Player,
  card: ActionCard,
): Flip7State {
  switch (card.kind) {
    case 'secondChance':
      player.field.secondChance = true;
      state.events.push({
        type: 'secondChance',
        playerId: player.id,
      });
      break;

    case 'freeze':
      break;
    case 'flipThree':
      state.pendingEffect = {
        type: card.kind,
        sourcePlayerId: player.id,
      };
      break;
  }

  return state;
}

/* =========================
   ドロー共通処理（簡易版）
========================= */

export function drawOne(state: Flip7State, player: Player): Flip7State {
  state = drawFromDiscardPile(state);

  const card = state.deck.pop();
  if (!card) return state;

  switch (card.type) {
    case 'number':
      return drawNumberCard(state, player, card);

    case 'modifier':
      return drawModifierCard(state, player, card);

    case 'action':
      return drawActionCard(state, player, card);
  }
}

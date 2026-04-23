import { LoveletterState, LoveletterConfig } from '../../shared/types';
import { decideRoundWinner } from './endGame';
import { getCardValue } from './getCardValue';

type EffectHandler = (
  state: LoveletterState,
  config?: LoveletterConfig,
) => LoveletterState;

// 効果自体を破棄
function clearEffect(state: LoveletterState): LoveletterState {
  state.pendingEffect = undefined;
  state.phase = 'RESOLVE';
  return state;
}

// 次のラウンド
function clearRound(state: LoveletterState): LoveletterState {
  state.pendingEffect = undefined;
  state.phase = 'ROUND_END';
  return state;
}

// バトルでの結果後に脱落処理を走らせる
function clearBattle(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'BATTLE') return state;

  // Apply battle result (eliminate loser)
  if (pending.loserId) {
    const loser = state.players.find((p) => p.id === pending.loserId);
    if (loser) {
      loser.isEliminated = true;
    }
  }

  // Clear effect and advance phase
  state.pendingEffect = undefined;
  state.phase = 'RESOLVE';
  return state;
}

// バトル処理
function resolveBattle(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'BATTLE') return state;

  const attacker = state.players.find((p) => p.id === pending.attackerId);
  const target = state.players.find((p) => p.id === pending.targetId);

  if (!attacker || !target) return state;

  const aVal = getCardValue(pending.myCard, attacker);
  const tVal = getCardValue(pending.targetCard, target);

  if (pending.rule === 'LOWER_LOSES') {
    if (aVal < tVal) {
      pending.loserId = attacker.id; // ⭐ここ
    } else if (aVal > tVal) {
      pending.loserId = target.id;
    }

    pending.sourceCard = 'KNIGHT';
  }

  if (pending.rule === 'HIGHER_LOSES') {
    if (aVal > tVal) {
      pending.loserId = attacker.id;
    } else if (aVal < tVal) {
      pending.loserId = target.id;
    }

    pending.sourceCard = 'SCHOLAR';
  }

  pending.resolved = true;
  state.phase = 'WAIT_EFFECT';

  return state;
}

// カードの交換
function resolveExchange(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'EXCHANGE') return state;

  const player = state.players.find((p) => p.id === pending.playerId);
  const target = state.players.find((p) => p.id === pending.targetId);

  if (!player || !target || !player.hand || !target.hand) return state;

  const temp = player.hand;
  player.hand = target.hand;
  target.hand = temp;

  pending.resolved = true;
  state.phase = 'RESOLVE';

  return state;
}

// 山札を捨てて引く
function resolveWizard(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'WIZARD') return state;

  const player = state.players.find((p) => p.id === pending.playerId);
  const target = state.players.find((p) => p.id === pending.targetId);

  if (!player || !target) return state;

  // 山札がある場合のみ処理
  if (state.deck.length > 0) {
    const newCard = state.deck.pop()!;

    // ターゲットの手札を更新
    target.hand = newCard;

    // 引いたカードをeffectに反映（UI用）
    pending.drawnCard = newCard;

    if (newCard.type === 'PRINCESS') {
      target.isEliminated = true;
    }
  }

  // 解決済みにする（UI表示トリガー）
  pending.resolved = true;
  state.phase = 'WAIT_EFFECT';

  return state;
}

//  CARD_SHOW後に勝者を決定してROUND_ENDへ
//  ラウンド終了時のカード比較UI;
function resolveCardShow(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'ROUND_END') return state;

  const winners = decideRoundWinner(state);

  // Removed point increment loop

  pending.winnerIds = winners;
  pending.resolved = true;
  state.phase = 'RESOLVE';

  return state;
}

// ラウンド終了時のUI用データ生成
// ✔ playerCards生成
// ✔ resolved = true
function resolveRoundEnd(state: LoveletterState): LoveletterState {
  const pending = state.pendingEffect;
  if (!pending || pending.type !== 'ROUND_END') return state;

  // HIGH_CARD時のみカード比較情報を作成
  if (pending.reason === 'HIGH_CARD') {
    pending.playerCards = state.players
      .map((p) => {
        const card = p.hand ?? p.drawnCard;

        if (!card) return null;

        return {
          playerId: p.id,
          card,
          value: getCardValue(card, p),
        };
      })
      .filter(
        (c): c is { playerId: string; card: any; value: number } => c !== null,
      );
    pending.resolved = false;
    state.phase = 'WAIT_EFFECT';
    return state;
  }

  pending.resolved = false;
  state.phase = 'WAIT_EFFECT';

  return state;
}

export const effectMap: Record<string, EffectHandler> = {
  CLEAR_EFFECT: clearEffect,
  CLEAR_ROUND: clearRound,
  CLEAR_BATTLE: clearBattle,
  BATTLE: resolveBattle,
  EXCHANGE: resolveExchange,
  WIZARD: resolveWizard,
  ROUND_END: resolveRoundEnd,
  CARD_SHOW: resolveCardShow,
} as const;

export function applyEffect(
  state: LoveletterState,
  effect: keyof typeof effectMap,
  config?: LoveletterConfig,
): LoveletterState {
  const fn = effectMap[effect];
  if (!fn) return state;
  return fn(state, config);
}

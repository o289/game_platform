import { LoveletterState, Player } from '../../shared/types';
import { getCardValue } from './getCardValue';

/**
 * ラウンド終了判定
 */
export function checkRoundEnd(state: LoveletterState): boolean {
  const alivePlayers = state.players.filter((p) => !p.isEliminated);

  if (alivePlayers.length <= 1) {
    return true;
  }

  if (state.deck.length === 0) {
    return true;
  }

  return false;
}

/**
 * ラウンド勝者決定（複数あり得る）
 */
export function decideRoundWinner(state: LoveletterState): string[] {
  const alivePlayers = state.players.filter((p) => !p.isEliminated);

  // ① 1人だけ生存
  if (alivePlayers.length === 1) {
    return [alivePlayers[0].id];
  }

  // ② 山札切れ → 強さ勝負
  if (state.deck.length === 0) {
    let max = -Infinity;
    let winners: Player[] = [];

    for (const p of alivePlayers) {
      if (!p.hand) continue;

      const value = getCardValue(p.hand, p);

      if (value > max) {
        max = value;
        winners = [p];
      } else if (value === max) {
        winners.push(p);
      }
    }

    return winners.map((p) => p.id);
  }

  return [];
}

/**
 * ゲーム終了判定
 * ※ 誰かが規定ポイントに到達しているか
 */
export function checkGameEnd(state: LoveletterState): boolean {
  for (const p of state.players) {
    if ((p.point ?? 0) >= state.winPointCondition) {
      return true;
    }
  }

  return false;
}

/**
 * ゲーム勝者決定（ポイント制）
 * ※ isGameEnded = true 前提（すでに誰かが規定ポイント到達済み）
 * ※ 同点の場合は脱落回数が少ない方が勝者
 */
export function decideGameWinner(state: LoveletterState): string | null {
  let candidates: Player[] = [];
  let maxPoint = -Infinity;

  // 最大ポイントのプレイヤーを抽出
  for (const p of state.players) {
    const score = p.point ?? 0;

    if (score > maxPoint) {
      maxPoint = score;
      candidates = [p];
    } else if (score === maxPoint) {
      candidates.push(p);
    }
  }

  // 同点の場合は脱落回数が少ない方
  let winner: Player = candidates[0];

  for (const p of candidates) {
    if (p.eliminatedCount < winner.eliminatedCount) {
      winner = p;
    }
  }

  return winner.id;
}

// ✔ ラウンド終了の判定
// ✔ 理由を決める（HIGH_CARD or LAST_SURVIVOR）
// ❌ UIデータは作らない
export function createRoundEndEffect(state: LoveletterState): LoveletterState {
  if (!checkRoundEnd(state)) {
    return state;
  }

  // ⭐ 山札切れ → ROUND_ENDでカード表示も行う
  if (state.deck.length === 0) {
    state.pendingEffect = {
      type: 'ROUND_END',
      winnerIds: [],
      reason: 'HIGH_CARD',
      playerCards: undefined,
      resolved: false,
    };

    return state;
  }

  // ⭐ 通常（最後の生存者）
  const winners = decideRoundWinner(state);

  // ⭐ ROUND_ENDに変換
  state.pendingEffect = {
    type: 'ROUND_END',
    winnerIds: winners,
    reason: 'LAST_SURVIVOR',
    playerCards: undefined,
    resolved: false,
  };

  return state;
}

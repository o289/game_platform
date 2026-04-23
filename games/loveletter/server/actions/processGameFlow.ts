import {
  LoveletterState,
  LoveletterConfig,
} from 'games/loveletter/shared/types';
import {
  checkRoundEnd,
  decideRoundWinner,
  checkGameEnd,
  decideGameWinner,
  createRoundEndEffect,
} from './endGame';
import { advanceTurn } from './handleActions';
import { initNextRound } from '../state/createGameState';

/**
 * processGameFlow
 *
 * ゲームの進行を一元管理する司令塔
 * - WAIT_EFFECT中は停止
 * - resolveStateで副作用反映
 * - ラウンド終了判定
 * - ゲーム終了判定
 * - ターン進行
 */
export function processGameFlow(
  state: LoveletterState,
  config: LoveletterConfig,
): LoveletterState {
  // UI待ち中は進めない
  if (state.phase !== 'RESOLVE' && state.phase !== 'ROUND_END') return state;

  // ラウンド終了判定
  if (checkRoundEnd(state) && state.phase !== 'ROUND_END') {
    const winners = decideRoundWinner(state);

    // ⭐ ポイント加算
    for (const winnerId of winners) {
      const p = state.players.find((pl) => pl.id === winnerId);
      if (p) {
        p.point = (p.point ?? 0) + 1;
      }
    }

    // ⭐ ゲーム終了判定（ポイント後に行う）
    if (checkGameEnd(state)) {
      const winner = decideGameWinner(state);

      state.isGameEnded = true;
      state.winnerId = winner ?? undefined;
      return state;
    }

    // ⭐ ラウンド終了演出（ゲーム続行時のみ）
    state = createRoundEndEffect(state);
    state.phase = 'WAIT_EFFECT';
    return state;
  }

  // ⭐ ROUND_END後 → 次ラウンド開始
  if (state.phase === 'ROUND_END') {
    return initNextRound(state, config);
  }

  // 通常進行（次のターンへ）
  return advanceTurn(state);
}

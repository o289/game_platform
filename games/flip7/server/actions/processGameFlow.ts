import { Flip7State, Flip7Config } from 'games/flip7/shared/types';
import {
  checkGameEnd,
  checkRoundEnd,
  advanceTurn,
  applyGameEnd,
  applyRoundEnd,
  decideWinners,
  updateRoundScores,
  applyTotalScores,
} from './gameFlowItems';
import { initNextRound } from '../state/createGameState';

/**
 * processGameFlow
 *
 * フリップ7の進行を一元管理する司令塔
 *
 * 方針：
 * - pendingEffect中は停止（対象選択待ち）
 * - ラウンド終了判定
 * - スコア確定
 * - ゲーム終了判定
 * - 次ラウンド or ターン進行
 */
export function processGameFlow(
  state: Flip7State,
  config: Flip7Config,
): Flip7State {
  let nextState = state;

  if (nextState.pendingEffect) {
    return nextState;
  }

  if (nextState.events.length > 0) {
    return nextState;
  }

  nextState = updateRoundScores(nextState, config);

  if (checkRoundEnd(nextState)) {
    nextState = applyRoundEnd(nextState);
  }

  if (nextState.phase === 'ROUND_END') {
    // ラウンド終了時に一度だけトータルスコアへ反映
    nextState = applyTotalScores(nextState);

    if (checkGameEnd(nextState, config)) {
      const winners = decideWinners(nextState);
      nextState = applyGameEnd(nextState, winners);
      return nextState;
    }

    return initNextRound(nextState);
  }

  nextState = advanceTurn(nextState);

  return nextState;
}

import {
  LoveletterState,
  eliminatedReason,
  CardType,
} from 'games/loveletter/shared/types';

/**
 * resolveState
 *
 * カード効果（resolveEffect）で立てられたフラグを元に、
 * 実際の状態変更・副作用・UI用イベントをまとめて処理する。
 *
 * このレイヤーでは以下を行う：
 * ・脱落プレイヤーの確定処理
 * ・手札の破棄
 * ・UI用 pendingEffect の生成
 */
export function resolveState(
  state: LoveletterState,
  reason_from: CardType,
): LoveletterState {
  state.players.forEach((player) => {
    // まだ処理されていない脱落プレイヤーのみ対象
    const alreadyHandled =
      state.pendingEffect?.type === 'ELIMINATED' &&
      state.pendingEffect.playerId === player.id;

    if (player.isEliminated && !alreadyHandled) {
      // --- 手札を破棄 ---
      if (player.hand) {
        player.discardPile.push(player.hand);
        player.hand = null;
      }

      if (player.drawnCard) {
        player.discardPile.push(player.drawnCard);
        player.drawnCard = null;
      }

      // --- UI用イベント発火 ---
      state.pendingEffect = {
        type: 'ELIMINATED',
        playerId: player.id,
        reason: eliminatedReason[reason_from] ?? '脱落',
        resolved: false,
      };
    }
  });

  return state;
}

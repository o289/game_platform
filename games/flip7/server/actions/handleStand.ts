import { Flip7State, Player } from 'games/flip7/shared/types';
import getCurrentUser from '../utils/getCurrentUser';

/**
 * handleStand
 *
 * プレイヤーが「パス（スタンド）」を選択したときの処理
 * - 現在プレイヤーを取得
 * - status を STOOD に変更
 * - この時点ではスコア確定はしない（ラウンド終了時にまとめて計算）
 */
export function handleStand(state: Flip7State): Flip7State {
  const player: Player = getCurrentUser(state);

  // すでに行動不能なら何もしない
  if (player.status !== 'PLAYING') {
    return state;
  }

  // スタンド（このラウンド終了まで待機）
  player.status = 'STOOD';
  state.events.push({
    type: 'stand',
    playerId: player.id,
  });

  return state;
}

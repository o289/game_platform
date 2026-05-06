import { Flip7State, Player } from '../../shared/types';
import { drawOne } from './drawAction';

/* =========================
   効果処理
========================= */

function resolveFreeze(state: Flip7State, target: Player): Flip7State {
  if (state.pendingEffect && target.status === 'PLAYING') {
    target.status = 'STOOD';
    state.events.push({
      type: 'freeze',

      from: state.pendingEffect.sourcePlayerId,

      to: target.id,
    });
  }
  return state;
}

function resolveFlipThree(state: Flip7State, target: Player): Flip7State {
  let nextState = state;

  nextState.events.push({
    type: 'flipThree',
    playerId: target.id,
  });

  for (let i = 0; i < 3; i++) {
    if (target.status !== 'PLAYING') break;

    nextState = drawOne(nextState, target);

    if (nextState.flip7PlayerId) {
      break;
    }
  }

  return nextState;
}

/**
 * 対象選択（freeze / flipThree の解決）
 */
export function handleSelectTarget(
  state: Flip7State,
  payload: { targetPlayerId: string },
): Flip7State {
  // pendingEffect がない場合は何もしない
  const effect = state.pendingEffect;
  if (!effect) {
    return state;
  }

  // 対象プレイヤー取得
  const target = state.players.find((p) => p.id === payload.targetPlayerId);

  if (!target) {
    throw new Error('TARGET_PLAYER_NOT_FOUND');
  }

  let nextState = state;

  switch (effect.type) {
    case 'freeze':
      nextState = resolveFreeze(nextState, target);
      break;

    case 'flipThree':
      nextState = resolveFlipThree(nextState, target);
      break;

    default:
      return nextState;
  }

  nextState.pendingEffect = undefined;

  return nextState;
}

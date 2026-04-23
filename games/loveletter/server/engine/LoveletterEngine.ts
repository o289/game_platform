/**
 * Loveletter Engine
 *
 * 役割:
 * - 初期GameState生成（init）
 * - Actionの処理（handleAction）
 * - ゲーム進行管理
 *
 * ※ 各ゲームでロジックを具体化してください
 */

import { GameEngine } from '@core-server/engine/GameEngine';
import { Action } from 'shared/types';
import { GameError } from '../../shared/types/Error';
import { createGameState } from '../state/createGameState';
import { handleDrawCard, handlePlayCard } from '../actions/handleActions';
import { applyEffect } from '../actions/effectActions';
import { processGameFlow } from '../actions/processGameFlow';
import { getPublicState } from '../generation/toPublic';

// 仮のState / Config（各ゲームで型を定義する）
type State = any;
type Config = any;

export const LoveletterEngine: GameEngine<State, Action, Config> = {
  /**
   * 初期化
   */
  init(config) {
    const players = config.players;

    return createGameState(
      {
        players,
      },
      config,
    );
  },

  /**
   * Action処理
   */
  handleAction(state, action, config) {
    let newState = structuredClone(state);

    switch (action.type) {
      case 'DRAW_CARD':
        newState = handleDrawCard(newState);
        break;

      case 'PLAY_CARD':
        newState = handlePlayCard(newState, action.payload);
        break;

      case 'APPLY_EFFECT':
        newState = applyEffect(newState, action.payload.effect, config);
        break;

      default:
        throw new GameError('INVALID_ACTION', 'このアクションは存在しません');
    }

    return processGameFlow(newState, config);
  },

  toPublicState(state, viewerId) {
    getPublicState(state, viewerId);
  },
};

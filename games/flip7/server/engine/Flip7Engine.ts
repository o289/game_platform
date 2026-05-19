/**
 * Flip7 Engine
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
import { handleDrawCard } from '../actions/handleDrawCard';
import { handleSelectTarget } from '../actions/handleSelectTarget';
import { handleStand } from '../actions/handleStand';
import { handleConsumeEvent } from '../actions/gameFlowItems';
import { processGameFlow } from '../actions/processGameFlow';

let requestCounter = 0;

// 仮のState / Config（各ゲームで型を定義する）
type State = any;
type Config = any;

export const Flip7Engine: GameEngine<State, Action, Config> = {
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
      case 'STAND':
        newState = handleStand(newState);
        break;
      case 'SELECT_ACTION_TARGET':
        newState = handleSelectTarget(newState, action.payload);
        break;
      case 'CONSUME_EVENT':
        newState = handleConsumeEvent(newState);
        break;

      default:
        throw new GameError('INVALID_ACTION', 'このアクションは存在しません');
    }
    const reqId = ++requestCounter;
    const now = new Date().toISOString();

    console.log(
      `[REQ ${reqId}] ${now} ▶ handleAction START | player=${newState.currentPlayer} | action=${action.type}`,
    );
    console.log(
      `[REQ ${reqId}] BEFORE processGameFlow | currentPlayer=${newState.currentPlayer}`,
    );

    newState = processGameFlow(newState, config);

    console.log(
      `[REQ ${reqId}] AFTER processGameFlow  | currentPlayer=${newState.currentPlayer}`,
    );
    console.log(`[REQ ${reqId}] ${now} ◀ handleAction END`);

    return newState;
  },
};

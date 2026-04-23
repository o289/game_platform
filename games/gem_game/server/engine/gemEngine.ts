import {
  handleBuyCard,
  handleReserveCard,
  handleTakeTokens,
  runGameFlow,
} from '../actions/handleActions';
import { GameEngine } from '@core-server/engine/GameEngine';
import { Action } from 'shared/types';
import { ActionError } from 'games/gem_game/shared/types';
import { createGameState } from '../state';

// 仮のState / Config（後で具体化）
type GemState = any;
type GemConfig = any;

export const gemEngine: GameEngine<GemState, Action, GemConfig> = {
  init(config) {
    // プレイヤーIDと名前のみ生成（createGameStateに渡す）
    const players = config.players;

    return createGameState(
      {
        players,
      },
      config,
    );
  },

  handleAction(state, action) {
    console.log('🔥 HANDLE ACTION CALLED 🔥', action);
    const newState = structuredClone(state);

    switch (action.type) {
      case 'TAKE_TOKENS':
        handleTakeTokens(newState, action.payload);
        break;

      case 'RESERVE_CARD':
        handleReserveCard(newState, action.payload);
        break;

      case 'BUY_CARD':
        handleBuyCard(newState, action.payload);
        break;

      default:
        throw new ActionError(
          'UNKNOWN_ACTION_TYPE',
          'このアクションは存在しません',
        );
    }

    // ② 共通のゲーム進行処理
    runGameFlow(newState);

    return newState;
  },
};



/**
 * __PASCAL_NAME__ Engine
 *
 * 役割:
 * - 初期GameState生成（init）
 * - Actionの処理（handleAction）
 * - ゲーム進行管理
 *
 * ※ 各ゲームでロジックを具体化してください
 */

import { GameEngine } from "@core-server/engine/GameEngine";
import { Action } from "shared/types";
import { GameError } from "../../shared/types/Error";
import { createGameState } from "../state/createGameState";

// 仮のState / Config（各ゲームで型を定義する）
type State = any;
type Config = any;

export const __PASCAL_NAME__Engine: GameEngine<State, Action, Config> = {
  /**
   * 初期化
   */
  init(config) {
    const players = config.players;

    return createGameState(
      {
        players,
      },
      config
    );
  },

  /**
   * Action処理
   */
  handleAction(state, action) {
    console.log("🔥 HANDLE ACTION:", action);

    const newState = structuredClone(state);

    switch (action.type) {
      case "INCREMENT":
        // サンプル処理
        if (typeof newState.count !== "number") {
          newState.count = 0;
        }
        newState.count++;
        break;

      default:
        throw new GameError(
          "INVALID_ACTION",
          "このアクションは存在しません"
        );
    }

    return newState;
  },
};
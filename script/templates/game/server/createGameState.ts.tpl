

/**
 * createGameState Template
 *
 * 役割:
 * - 初期GameStateを生成する
 * - init(config) から呼び出される
 *
 * ※ 各ゲームでState/Configの型を具体化してください
 */

// 仮の型（各ゲームで置き換える）
type State = any;
type Config = any;

type InitParams = {
  players: { id: string; name?: string }[];
  // 必要に応じて追加（例: deck, board, tokens など）
  [key: string]: any;
};

export function createGameState(params: InitParams, config: Config): State {
  const { players, ...rest } = params;

  // ベースの初期状態
  const baseState = {
    players,
    currentPlayer: players?.[0]?.id ?? null,
    turn: 0,

    // デバッグ用サンプル
    count: 0,

    // 拡張用（deck, board など）
    ...rest,

    // configを必要に応じて保持
    config,
  };

  return baseState as State;
}
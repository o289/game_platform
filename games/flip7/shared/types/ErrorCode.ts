/****
 * Game Error Codes
 *
 * ゲーム内ロジックで使用するエラーコードを定義する
 *
 * ルール:
 * - 大文字スネークケース
 * - ゲームロジックに関するもののみ定義
 * - socket / room / 接続系は含めない
 */

export type GameErrorCode =
  | "INVALID_ACTION"
  | "NOT_YOUR_TURN"
  | "INVALID_TARGET"
  | "CONDITION_NOT_MET"
  | "RESOURCE_NOT_ENOUGH"
  | "ALREADY_SELECTED"
  | "LIMIT_EXCEEDED";

/**
 * 例:
 *
 * "NOT_ENOUGH_TOKENS"
 * "CANNOT_BUY_CARD"
 * "INVALID_MOVE"
 */

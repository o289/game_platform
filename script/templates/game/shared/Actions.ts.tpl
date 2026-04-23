/**
 * Action Template
 *
 * このファイルではゲーム固有のActionを定義する
 *
 * ルール:
 * - typeは大文字スネークケース
 * - payloadには必要な情報のみを含める
 * - playerIdは含めない（socketから取得）
 */

// サンプルAction（最低限動作確認用）
export type GameAction =
  | {
      type: "INCREMENT";
      payload: {};
    };

/**
 * 今後の例:
 *
 * export type GameAction =
 *   | { type: "SELECT_CARD"; payload: { cardId: string } }
 *   | { type: "TAKE_TOKENS"; payload: { tokens: string[] } }
 */

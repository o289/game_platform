import { GameErrorCode } from './ErrorCode';

/**
 * Base Error Class
 *
 * すべてのゲームエラーの基底クラス
 */
export abstract class BaseError<T extends string> extends Error {
  code: T;

  constructor(code: T, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Game Error
 *
 * ゲームロジックで使用するエラー
 */
export class GameError extends BaseError<GameErrorCode> {
  constructor(code: GameErrorCode, message: string) {
    super(code, message);
  }
}

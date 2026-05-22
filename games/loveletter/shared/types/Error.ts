import { BaseError } from 'shared/types';
import { GameErrorCode } from './ErrorCode';

/**
 * Game Error
 *
 * ゲームロジックで使用するエラー
 */
export class GameError extends BaseError<GameErrorCode> {
  constructor(code: GameErrorCode, message: string) {
    super('game', code, message);
  }
}

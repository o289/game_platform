import { BaseGameError } from 'shared/types';
import { GameErrorCode } from './ErrorCode';

/**
 * Game Error
 *
 * ゲームロジックで使用するエラー
 */
export class GameError extends BaseGameError<GameErrorCode> {
  constructor(code: GameErrorCode, message: string) {
    super(code, message);
  }
}

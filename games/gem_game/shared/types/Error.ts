import { BaseGameError } from 'shared/types';
import { GameErrorCode } from './ErrorCode';

export class GameError extends BaseGameError<GameErrorCode> {
  constructor(code: GameErrorCode, message: string) {
    super(code, message);
  }
}

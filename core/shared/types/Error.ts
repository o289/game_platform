import { BaseError } from './BaseError';
// エラーコード、処理したいエラーはここに追加するだけにする
export const SYSTEM_ERROR_CODES = [
  'ROOM_NOT_FOUND',
  'PLAYER_NOT_FOUND',
  'ROOM_FULL',
  'ROOM_ALREADY_EXISTS',
  'GAME_ALREADY_STARTED',
  'NOT_ENOUGH_PLAYERS',
  'GAME_NOT_STARTED',
  'ALREADY_JOINED',
  'STATE_MISMATCH',
  'GAME_REPLAY_FAILED',
  'GAME_NOT_INITIALIZED',
] as const;
export type SystemErrorCode = (typeof SYSTEM_ERROR_CODES)[number];

export class SystemError extends BaseError<SystemErrorCode> {
  constructor(code: SystemErrorCode, message: string) {
    super(code, message);
  }
}

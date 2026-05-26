import { BaseError } from './BaseError';
import { GameType } from './Game';
import { Room } from './Room';
// エラーコード、処理したいエラーはここに追加するだけにする
export const SYSTEM_ERROR_CODES = [
  'ROOM_NOT_FOUND',
  'PLAYER_NOT_FOUND',
  'NAME_NOT_FOUND',
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

// リカバリー
export const RECOVERY_ACTIONS = [
  'restore_snapshot',
  'player_delete',
  'room_delete',
  'session_cleanup',
] as const;

export type RecoveryAction = (typeof RECOVERY_ACTIONS)[number];

// メタデータ
export type ErrorMetadata = {
  roomId?: string | null;
  playerId?: string | null;
  gameType?: GameType | null;
  roomSnapshot?: Room | null;
};

// roomSnapshot は live room reference を保持しない。必ず clone / snapshot 化した値を保存する。

export class SystemError extends BaseError<SystemErrorCode> {
  // recoveryがから配列の場合は、メッセージをアナウンスするだけという意味として解釈
  recovery: RecoveryAction[];

  metadata?: ErrorMetadata;

  constructor(params: {
    code: SystemErrorCode;
    message: string;
    recovery: RecoveryAction[];
    metadata?: ErrorMetadata;
  }) {
    super('system', params.code, params.message);

    this.recovery = params.recovery;
    this.metadata = params.metadata;
  }
}

// 各ゲームはこれを継承するようにする
export abstract class BaseGameError<T extends string> extends BaseError<T> {
  constructor(code: T, message: string) {
    super('game', code, message);
  }
}

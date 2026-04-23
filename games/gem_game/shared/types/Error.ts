import { ACTION_ERROR_CODES } from './ErrorCode';

// core/shared/types/Error.ts
export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];

export abstract class BaseError<T extends string> extends Error {
  code: T;

  constructor(code: T, message: string) {
    super(message);
    this.code = code;
  }
}

export class ActionError extends BaseError<ActionErrorCode> {
  constructor(code: ActionErrorCode, message: string) {
    super(code, message);
  }
}

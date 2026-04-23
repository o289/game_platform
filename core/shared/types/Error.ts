import { SYSTEM_ERROR_CODES } from './ErrorCode';

// core/shared/types/Error.ts
export type SystemErrorCode = (typeof SYSTEM_ERROR_CODES)[number];

export abstract class BaseError<T extends string> extends Error {
  code: T;

  constructor(code: T, message: string) {
    super(message);
    this.code = code;
  }
}

export class SystemError extends BaseError<SystemErrorCode> {
  constructor(code: SystemErrorCode, message: string) {
    super(code, message);
  }
}

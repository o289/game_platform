import { BaseError } from 'shared/types';
import { ACTION_ERROR_CODES } from './ErrorCode';

// core/shared/types/Error.ts
export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];
export class ActionError extends BaseError<ActionErrorCode> {
  constructor(code: ActionErrorCode, message: string) {
    super(code, message);
  }
}

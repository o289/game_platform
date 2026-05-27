import { SystemError, RecoveryAction } from 'shared/types';

export type RecoveryResult =
  | { success: true }
  | {
      success: false;
      fallback: RecoveryAction;
    };

export class RecoveryManager {
  // systemError専用
  static execute(error: SystemError) {
    switch (error.code) {
      default:
        return {
          success: false,
          fallback: 'session_cleanup',
        } satisfies RecoveryResult;
    }
  }
}

import { BaseGameError, SystemError, UIErrorResponse } from 'shared/types';
import { RecoveryManager, RecoveryResult } from '../recovery/RecoveryManager';

type ErrorStore = {
  setError: ((error: UIErrorResponse | null) => void) | null;
};

export class ErrorManager {
  private static errorStore: ErrorStore = {
    setError: null,
  };

  // UI表示用に加工
  private static present(
    error: unknown,
    recoveryResult?: RecoveryResult,
  ): UIErrorResponse {
    // SystemError
    if (error instanceof SystemError) {
      return {
        title: 'システムエラー',
        message: error.message,
      };
    }

    // BaseGameError
    if (error instanceof BaseGameError) {
      return {
        title: '無効なアクション',
        message: error.message,
      };
    }

    // fallback
    return {
      title: '不明なエラー',
      message: '予期しないエラーが発生しました',
    };
  }

  private static setAnnounce(title: string, message: string) {
    this.errorStore.setError?.({
      title,
      message,
    });
  }

  // エラーの入口
  static capture(error: unknown): UIErrorResponse {
    // SystemError の場合は recovery 実行
    if (error instanceof SystemError) {
      const recoveryResult = RecoveryManager.execute(error);

      const announceError = this.present(error, recoveryResult);

      return announceError;
    }

    // BaseGameError
    if (error instanceof BaseGameError) {
      const announceError = this.present(error);

      return announceError;
    }

    // 想定外
    const announceError = this.present(new Error('Unknown Error'));

    return announceError;
  }

  // エラーの出口
  static announce(setter: (error: UIErrorResponse | null) => void) {
    this.errorStore.setError = setter;
  }
}

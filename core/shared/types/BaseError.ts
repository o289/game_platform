export type ErrorCategory = 'system' | 'game';
export abstract class BaseError<T extends string> extends Error {
  category: ErrorCategory;
  code: T;

  constructor(category: ErrorCategory, code: T, message: string) {
    super(message);
    this.category = category;
    this.code = code;
  }
}

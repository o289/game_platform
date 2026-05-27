export abstract class BaseError<T extends string> extends Error {
  code: T;

  constructor(code: T, message: string) {
    super(message);
    this.code = code;
  }
}

export const ACTION_ERROR_CODES = [
  'INVALID_TOKEN_SELECTION',
  'TOKENS_MUST_BE_DIFFERENT',
  'TOKEN_NOT_AVAILABLE',
  'TOKEN_LIMIT_EXCEEDED',
  'NOT_ENOUGH_TOKENS',
  'CANNOT_BUY_CARD',
  'CARD_NOT_FOUND',
  'RESERVE_LIMIT_REACHED',
  'INVALID_PAYMENT',
  'DECK_EMPTY',
  'UNKNOWN_ACTION_TYPE',
] as const;

export function isRoomError(
  code: string,
): code is (typeof ACTION_ERROR_CODES)[number] {
  return (ACTION_ERROR_CODES as readonly string[]).includes(code);
}

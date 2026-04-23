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

export function isRoomError(
  code: string,
): code is (typeof SYSTEM_ERROR_CODES)[number] {
  return (SYSTEM_ERROR_CODES as readonly string[]).includes(code);
}

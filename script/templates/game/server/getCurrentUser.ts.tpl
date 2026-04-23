import { __PASCAL_NAME__State, Player } from "../../shared/types";

export default function getCurrentUser(state: __PASCAL_NAME__State): Player {
  const player = state.players.find(
    (p) => p.id === state.currentPlayer
  );

  if (!player) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  return player;
}
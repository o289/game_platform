import { Player } from "./Player";

export type __PASCAL_NAME__State = {
  players: Player[];

  currentPlayer: string;

  roundStartPlayer: string;

  roundEndTriggered: boolean;

  turn: number;
  
  winCondition: any
  winnerId?: string;
  winnerName?: string;
};
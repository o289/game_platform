import { Player } from './Player';
import { Action } from './Action';
import { GameType } from './Game';

export type RoomStatus =
  | 'init'
  | 'waiting'
  | 'gameWaiting'
  | 'playing'
  | 'finished';

export type Room = {
  id: string;
  players: Player[];
  hostId: string;
  actionLogs: Action[];
  status: RoomStatus;
  // プレイするゲーム
  gameType: GameType | null;
  // プレイするゲームが持つ情報
  gameState: any;
  // プレイするゲームのカスタムルール情報
  gameConfig: any;
};

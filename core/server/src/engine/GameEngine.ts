import { Action as BaseAction } from 'shared/types';

export interface GameEngine<
  State = any,
  A extends BaseAction = BaseAction,
  Config = any,
> {
  init(config: Config): State;

  handleAction(state: State, action: A, config: Config): State;

  // optional
  toPublicState?(state: State, viewerId: string): State;

  validateAction?(state: State, action: A): void;

  isGameOver?(state: State): boolean;

  getWinner?(state: State): any;
}

import { Flip7State } from '../../shared/types';
import getCurrentUser from '../utils/getCurrentUser';
import { drawOne } from './drawAction';

export function handleDrawCard(state: Flip7State): Flip7State {
  const player = getCurrentUser(state);

  if (!player || player.status !== 'PLAYING') {
    return state;
  }

  return drawOne(state, player);
}

export type Game = {
  id: string;
  name: string;
  image: string;
};

export const GAMES = [
  {
    id: 'loveletter',
    name: 'ラブレター',
    image: '/games/loveletter/img/box.png',
  },
  {
    id: 'gem_game',
    name: '宝石の煌めき',
    image: '/games/gem_game/img/box.png',
  },
] as const;

export type GameType = (typeof GAMES)[number]['id'];

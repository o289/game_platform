export type Game = {
  id: string;
  name: string;
  image: string;
};

export const GAMES = [
  
  {
    id: "ito",
    name: "Ito",
    image: "/games/ito/img/box.png"
  },{
    id: 'flip7',
    name: 'Flip7',
    image: '/games/flip7/img/box.png',
  },
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

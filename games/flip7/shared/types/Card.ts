export type NumberCard = {
  type: 'number';
  value: number; // 0〜12
};

export type ScoreModifierCard = {
  type: 'modifier';
  kind: 'add' | 'multiply';
  value: number; // addなら +2など / multiplyなら2
};

export type ActionCard = {
  type: 'action';
  kind: 'freeze' | 'flipThree' | 'secondChance';
};

export type Card = NumberCard | ScoreModifierCard | ActionCard;

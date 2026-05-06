export type Flip7Config = {
  // 勝利条件
  targetScore: number; // デフォルト: 200
  // フリップ7ボーナス
  flip7Bonus: number; // デフォルト: 15
};

export const defaultConfig: Flip7Config = {
  targetScore: 200,
  flip7Bonus: 15,
};

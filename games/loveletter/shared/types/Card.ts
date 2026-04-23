// カードID（種類）
export type CardType =
  // --- 基本カード ---
  | 'SOLDIER' // 1：相手のカードを当てて一致すれば脱落
  | 'CLOWN' // 2：相手の手札を見る
  | 'KNIGHT' // 3：手札を比較し小さい方が脱落
  | 'PRIEST' // 4：次の自分のターンまで無敵
  | 'WIZARD' // 5：手札を捨てて引き直し（自分 or 相手）
  | 'GENERAL' // 6：相手と手札を交換
  | 'MINISTER' // 7：合計12以上で脱落
  | 'PRINCESS' // 8：捨てたら脱落

  // --- 追加カード ---
  | 'COMMONER' // 0：終了時に7として扱う
  | 'SERVANT' // 1：選んだ2人が手札を交換
  | 'FORTUNE_TELLER' // 2：山札の一番上を見て交換
  | 'MERCHANT' // 3：手札が3以下なら対象を脱落させる
  | 'BUTLER' // 4：手札の強さに＋2
  | 'SCHOLAR' // 5：手札を比較し大きい方が脱落
  | 'DOG' // 6：場に出せない
  | 'QUEEN_MOTHER' // 7：捨て札合計が5以上で脱落
  | 'MARQUISE' // 7：手札合計12以上なら強制的に出す
  | 'COUNTESS' // 8：出せない / 山札がなくなったら脱落
  | 'PRINCESS_SECOND' // 8：脱落時に復帰
  | 'PRINCESS_THIRD' // 8：捨てたら脱落＋即ゲーム終了
  | 'PRINCE' // 8：捨てたら脱落
  | 'KING_FATAL'; // ×：引いたら即脱落

export type Card = {
  type: CardType;
  value: number;
};

export type CardPool = {
  type: CardType;
  count: number;
};

type CardMeta = {
  label: string;
  textColor: string;
  explain: string;
  imageName: string;
};

export const CARD_META: Record<CardType, CardMeta> = {
  SOLDIER: {
    label: '兵士',
    textColor: 'text-blue-600',
    explain: '当てたら脱落させる',
    imageName: 'soldier',
  },
  CLOWN: {
    label: '道化',
    textColor: 'text-purple-600',
    explain: '手札を見る',
    imageName: 'clown',
  },
  KNIGHT: {
    label: '騎士',
    textColor: 'text-gray-700',
    explain: '小さい方が脱落',
    imageName: 'knight',
  },
  PRIEST: {
    label: '僧侶',
    textColor: 'text-green-600',
    explain: '次の手番まで無敵',
    imageName: 'priest',
  },
  WIZARD: {
    label: '魔術師',
    textColor: 'text-indigo-600',
    explain: '捨てて引き直し',
    imageName: 'wizard',
  },
  GENERAL: {
    label: '将軍',
    textColor: 'text-yellow-600',
    explain: '手札を交換',
    imageName: 'general',
  },
  MINISTER: {
    label: '大臣',
    textColor: 'text-orange-600',
    explain: '合計12以上で脱落',
    imageName: 'minister',
  },
  PRINCESS: {
    label: '姫',
    textColor: 'text-pink-600',
    explain: '捨てたら脱落',
    imageName: 'princess',
  },
  COMMONER: {
    label: '町娘',
    textColor: 'text-gray-500',
    explain: '終了時に7として扱う',
    imageName: 'commoner',
  },
  SERVANT: {
    label: '使用人',
    textColor: 'text-teal-600',
    explain: '2人の手札を交換',
    imageName: 'servant',
  },
  FORTUNE_TELLER: {
    label: '占い師',
    textColor: 'text-violet-600',
    explain: '山札トップを見て交換',
    imageName: 'fortune_teller',
  },
  MERCHANT: {
    label: '商人',
    textColor: 'text-amber-700',
    explain: '手札が3以下なら脱落',
    imageName: 'merchant',
  },
  BUTLER: {
    label: '執事',
    textColor: 'text-slate-600',
    explain: '手札に+2',
    imageName: 'butler',
  },
  SCHOLAR: {
    label: '学者',
    textColor: 'text-cyan-700',
    explain: '大きい方が脱落',
    imageName: 'scholar',
  },
  DOG: {
    label: '犬',
    textColor: 'text-stone-700',
    explain: '出せない',
    imageName: 'dog',
  },
  QUEEN_MOTHER: {
    label: '王太后',
    textColor: 'text-rose-700',
    explain: '捨て札合計5以上で脱落',
    imageName: 'queen_mother',
  },
  MARQUISE: {
    label: '女侯爵',
    textColor: 'text-fuchsia-700',
    explain: '12以上なら強制プレイ',
    imageName: 'marquise',
  },
  COUNTESS: {
    label: '伯爵夫人',
    textColor: 'text-rose-500',
    explain: '出せない',
    imageName: 'countess',
  },
  PRINCESS_SECOND: {
    label: '姫(次女)',
    textColor: 'text-pink-500',
    explain: '脱落時に復帰',
    imageName: 'princess_second',
  },
  PRINCESS_THIRD: {
    label: '姫(三女)',
    textColor: 'text-pink-700',
    explain: '捨てたら脱落＋即終了',
    imageName: 'princess_third',
  },
  PRINCE: {
    label: '王子',
    textColor: 'text-yellow-700',
    explain: '捨てたら脱落',
    imageName: 'prince',
  },
  KING_FATAL: {
    label: '王',
    textColor: 'text-red-700',
    explain: '引いたら脱落',
    imageName: 'king_fatal',
  },
};

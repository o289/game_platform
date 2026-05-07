import { Card } from 'games/flip7/shared/types';

/* =========================
   数字カード生成
========================= */

function createNumberCards(): Card[] {
  const cards: Card[] = [];

  for (let value = 0; value <= 12; value++) {
    const count = value === 0 ? 1 : value;

    for (let i = 0; i < count; i++) {
      cards.push({
        type: 'number',
        value,
      });
    }
  }

  return cards;
}

/* =========================
   得点修正カード生成
========================= */

function createModifierCards(): Card[] {
  return [
    { type: 'modifier', kind: 'add', value: 2 },
    { type: 'modifier', kind: 'add', value: 4 },
    { type: 'modifier', kind: 'add', value: 6 },
    { type: 'modifier', kind: 'add', value: 8 },
    { type: 'modifier', kind: 'add', value: 10 },
    { type: 'modifier', kind: 'multiply', value: 2 },
  ];
}

/* =========================
   アクションカード生成
========================= */

function createActionCards(): Card[] {
  const actions: Card[] = [];

  const kinds: ('freeze' | 'flipThree' | 'secondChance')[] = [
    'freeze',
    'flipThree',
    'secondChance',
  ];

  for (const kind of kinds) {
    for (let i = 0; i < 3; i++) {
      actions.push({
        type: 'action',
        kind,
      });
    }
  }

  return actions;
}

/* =========================
   シャッフル
========================= */

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/* =========================
   デッキ生成
========================= */

export function createDeck(): Card[] {
  const numberCards = createNumberCards();
  const modifierCards = createModifierCards();
  const actionCards = createActionCards();

  const deck = [...numberCards, ...modifierCards, ...actionCards];

  return shuffle(deck);
}

/* =========================
   デッキ配布
========================= */

export function drawCard(deck: Card[]): Card | null {
  if (deck.length === 0) return null;

  const card = deck.pop();
  return card ?? null;
}

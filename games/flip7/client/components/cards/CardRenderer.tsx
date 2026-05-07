import { Card } from 'games/flip7/shared/types';
import { FreezeCard, FlipThreeCard, SecondChanceCard } from './ActionCards';
import { ModifierCard } from './ModifierCard';
import { NumberCard } from './NumberCard';

export function CardRenderer({ card }: { card: Card }) {
  switch (card.type) {
    case 'number':
      return <NumberCard value={card.value} />;

    case 'modifier':
      return <ModifierCard value={card.value} type={card.kind} />;

    case 'action':
      switch (card.kind) {
        case 'freeze':
          return <FreezeCard />;

        case 'flipThree':
          return <FlipThreeCard />;

        case 'secondChance':
          return <SecondChanceCard />;

        default:
          return null;
      }

    default:
      return null;
  }
}

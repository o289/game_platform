type CardProps = {
  value: number;
};

const VALUE_STYLE_MAP: Record<number, { text: string; pill: string }> = {
  12: { text: 'text-blue-500', pill: 'bg-blue-500' },
  11: { text: 'text-blue-500', pill: 'bg-blue-500' },
  10: { text: 'text-red-500', pill: 'bg-red-500' },
  9: { text: 'text-orange-400', pill: 'bg-orange-400' },
  8: { text: 'text-green-500', pill: 'bg-green-500' },
  7: { text: 'text-purple-500', pill: 'bg-purple-500' },
  6: { text: 'text-pink-500', pill: 'bg-pink-500' },
  5: { text: 'text-green-400', pill: 'bg-green-400' },
  4: { text: 'text-cyan-400', pill: 'bg-cyan-400' },
  3: { text: 'text-red-400', pill: 'bg-red-400' },
  2: { text: 'text-yellow-400', pill: 'bg-yellow-400' },
  1: { text: 'text-lime-400', pill: 'bg-lime-400' },
  0: { text: 'text-gray-500', pill: 'bg-gray-500' },
};

const LABEL_MAP: string[] = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
];

export function NumberCard({ value }: CardProps) {
  const style = VALUE_STYLE_MAP[value] ?? VALUE_STYLE_MAP[0];
  const label = LABEL_MAP[value] ?? '';

  return (
    <div className="relative w-full max-w-[180px] aspect-[180/260] bg-[#d9d2b3] rounded-[10%] border-[3%] border-[#bfb89a] shadow-[0_10%_20%_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-[5%]">
      {/* inner border */}
      <div className="absolute inset-[3%] rounded-[6%] border-[1.5%] border-[#e9e3c8]" />

      {/* top bar */}
      <div className="absolute top-[7%] w-[70%] h-[4%] bg-[#bfb89a] rounded-md" />

      {/* side pills */}
      <div
        className={`absolute left-[4%] top-1/2 -translate-y-1/2 w-[10%] h-[25%] rounded-[6%] ${style.pill}`}
      />
      <div
        className={`absolute right-[4%] top-1/2 -translate-y-1/2 w-[10%] h-[25%] rounded-[6%] ${style.pill}`}
      />

      {/* number */}
      <div
        className={`mt-[10%] text-[4em] font-black tracking-wide ${style.text}`}
      >
        {value}
      </div>

      {/* label */}
      <div className="absolute bottom-[18%] text-[0.8em] tracking-[0.4em] text-gray-600">
        {label}
      </div>

      {/* bottom plate */}
      <div className="relative w-[80%] h-[10%] bg-[#e4ddc2] rounded-[6%] flex items-center justify-center">
        <div className="absolute w-[70%] h-[2%] bg-[#bfb89a] rounded-md" />
      </div>
    </div>
  );
}

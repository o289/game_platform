type ModifierCardProps = {
  value: number; // 2,4,6,8,10 or 2 (for ×2)
  type: 'add' | 'multiply';
};

export function ModifierCard({ value, type }: ModifierCardProps) {
  const isMultiply = type === 'multiply';
  const display = isMultiply ? `×${value}` : `+${value}`;

  return (
    <div className="relative w-full max-w-[160px] aspect-[160/240] rounded-[8%] border-[3%] border-[#c78a2a] bg-gradient-to-b from-[#f3b54c] to-[#e39d2f] shadow-[0_10%_20%_rgba(0,0,0,0.5)] flex items-center justify-center">
      {/* inner frame */}
      <div className="absolute inset-[3%] rounded-[6%] border-[1.5%] border-[#f6d08b]" />

      {/* top ornament */}
      <div className="absolute top-[4%] w-1/2 h-[4%] bg-[#f6d08b] rounded-full" />

      {/* bottom ornament */}
      <div className="absolute bottom-[4%] w-1/2 h-[4%] bg-[#f6d08b] rounded-full" />

      {/* top text */}
      <div className="absolute top-[18%] text-[0.65em] text-center w-[80%] text-[#5a4a2a] leading-tight">
        {display} THE SUM OF YOUR NUMBER CARDS
      </div>

      {/* main value */}
      <div className="text-[3em] font-black drop-shadow-[0.1em_0.1em_0_rgba(0,0,0,0.2)] text-[#d94b4b]">
        {display}
      </div>

      {/* bottom text */}
      <div className="absolute bottom-[18%] text-[0.65em] text-center w-[80%] text-[#5a4a2a] leading-tight">
        {display} THE SUM OF YOUR NUMBER CARDS
      </div>
    </div>
  );
}

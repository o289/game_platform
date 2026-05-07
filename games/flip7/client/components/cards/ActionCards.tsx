// =========================
// Base (非公開)
// =========================
function ActionCardBase({
  bg,
  label,
  icon,
}: {
  bg: string;
  label: string;
  icon: string;
}) {
  return (
    <div
      className={`relative w-full max-w-[160px] aspect-[160/260] rounded-[8%] border-[3%] border-[#bfb89a] ${bg} shadow-[0_10%_20%_rgba(0,0,0,0.5)] flex items-center justify-center`}
    >
      {/* inner frame */}
      <div className="absolute inset-[3%] rounded-[6%] border-[1.5%] border-white/60" />

      {/* top ornament */}
      <div className="absolute top-[5%] w-1/2 h-[4%] bg-white/60 rounded-full" />

      {/* bottom ornament */}
      <div className="absolute bottom-[5%] w-1/2 h-[4%] bg-white/60 rounded-full" />

      {/* top icon */}
      <div className="absolute top-[12%] left-[12%] text-[1.6em]">{icon}</div>

      {/* bottom icon */}
      <div className="absolute bottom-[12%] right-[12%] text-[1.6em]">
        {icon}
      </div>

      {/* lightning */}
      <div className="absolute top-[30%] right-[15%] text-[1em] rotate-12">
        ⚡
      </div>
      <div className="absolute bottom-[30%] left-[15%] text-[1em] -rotate-12">
        ⚡
      </div>

      {/* banner */}
      <div className="absolute w-[120%] bg-[#f1efe6] text-[#333] text-center font-bold tracking-[0.1em] py-[3%] rotate-[-8deg] shadow-md">
        {label}
      </div>
    </div>
  );
}

// =========================
// Freeze
// =========================
export function FreezeCard() {
  return <ActionCardBase bg="bg-[#7cc6e6]" label="FREEZE" icon="🔒" />;
}

// =========================
// Flip Three
// =========================
export function FlipThreeCard() {
  return <ActionCardBase bg="bg-[#e6e34c]" label="FLIP THREE" icon="🃏" />;
}

// =========================
// Second Chance
// =========================
export function SecondChanceCard() {
  return <ActionCardBase bg="bg-[#e65a5a]" label="SECOND CHANCE" icon="❤️" />;
}

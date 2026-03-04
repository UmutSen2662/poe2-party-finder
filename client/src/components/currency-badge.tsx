export function CurrencyBadge({
  currency,
  showLabel = true,
}: {
  currency: "divine" | "chaos";
  showLabel?: boolean;
}) {
  const isDivine = currency === "divine";
  return (
    <span className="flex items-center gap-2">
      <div
        className={`flex shrink-0 items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold border ${
          isDivine
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
            : "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30"
        }`}
      >
        {isDivine ? "D" : "C"}
      </div>
      {showLabel && (
        <span className="truncate">
          {isDivine ? "Divine Orb" : "Chaos Orb"}
        </span>
      )}
    </span>
  );
}

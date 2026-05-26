import { cn } from "@/lib/utils";

export function CurrencyBadge({
  currency,
  showLabel = true,
  className,
  size = 16,
}: {
  currency: "divine" | "chaos";
  showLabel?: boolean;
  className?: string;
  size?: number;
}) {
  const isDivine = currency === "divine";

  return (
    <span
      className={cn("flex items-center", className)}
      style={{ fontSize: `${size}px` }}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold border aspect-square text-[0.6em]",
          isDivine
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
            : "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
        )}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {isDivine ? "D" : "C"}
      </div>
      {showLabel && (
        <span className="truncate ml-[0.5em]">
          {isDivine ? "Divine Orb" : "Chaos Orb"}
        </span>
      )}
    </span>
  );
}

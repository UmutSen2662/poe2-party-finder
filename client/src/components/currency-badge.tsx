import { cn } from "@/lib/utils";

export interface ServerCurrency {
  name: string;
  icon: string | null;
}

export type CurrencyInput = "divine" | "chaos" | ServerCurrency;

export function normalizeCurrency(currency: CurrencyInput): ServerCurrency {
  if (typeof currency === "string") {
    return {
      name: currency === "divine" ? "Divine Orb" : "Chaos Orb",
      icon: null,
    };
  }
  return currency;
}

export function CurrencyBadge({
  currency,
  showLabel = true,
  className,
  size = 16,
}: {
  currency: CurrencyInput;
  showLabel?: boolean;
  className?: string;
  size?: number;
}) {
  const { name, icon } = normalizeCurrency(currency);

  return (
    <span className={cn("flex items-center gap-2", className)}>
      {icon && (
        <img
          src={icon}
          alt={name}
          className="shrink-0 object-contain"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )}
      {showLabel && <span className="truncate">{name}</span>}
    </span>
  );
}

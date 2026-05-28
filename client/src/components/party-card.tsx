import { Clock, Lock, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime, useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import {
  CurrencyBadge,
  type CurrencyInput,
  normalizeCurrency,
} from "./currency-badge";

/**
 * After this many ms with no refresh, the per-card data is considered stale
 * and the refresh button surfaces an "UPDATE" affordance.
 */
const STALE_THRESHOLD_MS = 3 * 60 * 1000;

interface PartyCardProps {
  title: string;
  ign: string;
  rating: number;
  category: string;
  categoryImage?: string | null;
  description: string;
  fee: number;
  currency: CurrencyInput;
  currentQueue: number;
  maxQueue: number;
  /** Server-provided creation time. Drives the live "Listed Xm ago" label. */
  createdAt?: Date | string | null;
  /**
   * Local timestamp (ms) of when this card's data was last fetched/refreshed.
   * When provided, the refresh button is shown and staleness is computed from
   * how long it's been since this value.
   */
  lastRefreshedAt?: number;
  isDisabled?: boolean;
  hasApplied?: boolean;
  onRefresh?: () => void;
  onApply?: () => void;
  hostBadges?: Array<{
    id: number;
    name: string;
    icon: string | null;
    rarity: "common" | "uncommon" | "rare" | "legendary";
  }>;
}

export function PartyCard({
  title,
  ign,
  rating,
  category,
  categoryImage,
  description,
  fee,
  currency,
  currentQueue,
  maxQueue,
  createdAt,
  lastRefreshedAt,
  isDisabled = false,
  hasApplied = false,
  onRefresh,
  onApply,
  hostBadges = [],
}: PartyCardProps) {
  const now = useNow();
  const createdAtMs = createdAt ? new Date(createdAt).getTime() : null;
  const canRefresh = lastRefreshedAt !== undefined && !isDisabled;
  const isStale =
    canRefresh && now - (lastRefreshedAt as number) > STALE_THRESHOLD_MS;

  return (
    <Card
      className={cn(
        "relative overflow-hidden z-0 bg-[#111] border p-4",
        isDisabled ? "opacity-85 border-zinc-800/60" : "border-white/10",
        canRefresh && "group",
      )}
    >
      {/* Ambient Category Background */}
      <div
        className={cn(
          "absolute inset-0 z-[-1] pointer-events-none overflow-hidden",
          isDisabled && "grayscale opacity-40",
        )}
      >
        {categoryImage ? (
          <div
            className="absolute inset-0 bg-no-repeat bg-left bg-contain opacity-40 mix-blend-screen"
            style={{
              backgroundImage: `url(${categoryImage})`,
              WebkitMaskImage:
                "linear-gradient(to right, black 0%, black 25%, transparent 75%)",
              maskImage:
                "linear-gradient(to right, black 0%, black 25%, transparent 75%)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mix-blend-screen" />
        )}
      </div>

      {/* Refresh Button */}
      {canRefresh && (
        <Button
          variant={isStale ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={onRefresh}
          className={cn(
            "absolute top-3 right-3 z-20 bg-black/80",
            !isStale && "opacity-0 group-hover:opacity-100 transition-all",
            isStale &&
              "opacity-100 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30",
          )}
        >
          <RefreshCw className="size-4" />
          {isStale && (
            <span className="text-xs font-semibold ml-1">UPDATE</span>
          )}
        </Button>
      )}

      {/* Main Content */}
      <div className="flex items-stretch gap-3">
        {/* Left Column - Host Info */}
        <div className="w-32 shrink-0 flex flex-col gap-3">
          {/* IGN and Rating */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "font-semibold mr-3 text-ellipsis whitespace-nowrap overflow-hidden",
                isDisabled ? "text-zinc-400" : "text-white",
              )}
            >
              {ign}
            </span>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded",
                isDisabled
                  ? "bg-green-900/40 text-white/60 grayscale"
                  : "bg-green-600 text-white",
              )}
            >
              <span className="text-xs font-bold">{rating}</span>
            </div>
          </div>

          {/* Badges Row */}
          <div
            className={cn(
              "flex gap-1 rounded-md",
              isDisabled && "grayscale opacity-70",
            )}
          >
            {[0, 1, 2].map((slotIndex) => {
              const slotBadge = hostBadges[slotIndex];
              return (
                <div
                  key={slotIndex}
                  className="flex-1 aspect-square bg-white/20 rounded flex items-center justify-center text-lg"
                  title={slotBadge?.name}
                >
                  {slotBadge?.icon || (slotBadge ? "🏆" : null)}
                </div>
              );
            })}
          </div>

          {/* Listed Time */}
          {createdAtMs !== null && (
            <div className="mt-auto flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/60" />
              <p className="text-xs text-white/60">
                Listed {formatRelativeTime(createdAtMs, now)}
              </p>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <Separator
          orientation="vertical"
          className="bg-white/10 relative z-10"
        />

        {/* Middle Column - Details */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center overflow-hidden">
          {/* Category and Title Row */}
          <div className="flex items-center gap-2 mb-2 w-full min-w-0">
            <Badge className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white shrink-0">
              {category}
            </Badge>
            <h3
              className={cn(
                "font-semibold text-base truncate overflow-hidden flex-1 min-w-0 w-0",
                isDisabled ? "text-white/60" : "text-white",
              )}
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-sm whitespace-pre-line line-clamp-5 min-h-[5lh] drop-shadow-sm",
              isDisabled ? "text-white/60" : "text-zinc-200",
            )}
          >
            {description}
          </p>
        </div>

        {/* Vertical Divider */}
        <Separator
          orientation="vertical"
          className="bg-white/10 relative z-10"
        />

        {/* Right Column - Price & Action */}
        <div className="w-32 shrink-0 flex flex-col gap-2">
          {/* Fee */}
          <div className="flex items-center gap-1">
            <CurrencyBadge
              size={20}
              className="pb-0.5"
              currency={currency}
              showLabel={false}
            />
            <span
              className={cn(
                "whitespace-nowrap",
                isDisabled ? "text-white/60" : "text-white",
              )}
            >
              {fee} {normalizeCurrency(currency).name}
            </span>
          </div>

          {/* Queue Status */}
          <div className="flex items-center gap-2 mt-auto">
            <Users
              className={cn(
                "size-4",
                isDisabled ? "text-white/60" : "text-zinc-400",
              )}
            />
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                isDisabled ? "text-white/60" : "text-zinc-400",
              )}
            >
              {currentQueue} / {maxQueue} Filled
            </span>
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            disabled={isDisabled || hasApplied}
            onClick={onApply}
            variant={
              isDisabled ? "outline" : hasApplied ? "secondary" : "default"
            }
          >
            {isDisabled ? (
              <>
                <Lock className="size-4" />
                Lobby Started
              </>
            ) : hasApplied ? (
              "Applied"
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

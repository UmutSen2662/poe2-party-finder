import { Clock, Lock, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CurrencyBadge } from "./currency-badge";

interface PartyCardProps {
  ign: string;
  rating: number;
  category: string;
  categoryColor: string;
  description: string;
  fee: number;
  currency: "divine" | "chaos";
  currentQueue: number;
  maxQueue: number;
  isFresh?: boolean;
  isStale?: boolean;
  isDisabled?: boolean;
  onRefresh?: () => void;
  onApply?: () => void;
}

export function PartyCard({
  ign,
  rating,
  category,
  categoryColor,
  description,
  fee,
  currency,
  currentQueue,
  maxQueue,
  isFresh = true,
  isStale = false,
  isDisabled = false,
  onRefresh,
  onApply,
}: PartyCardProps) {
  const isStaleOrFresh = !isDisabled;
  const showRefreshButton = isStale || isFresh;

  return (
    <Card
      className={cn(
        "relative overflow-hidden z-0 bg-[#111] border p-4",
        isDisabled ? "opacity-85 border-zinc-800/60" : "border-white/10",
        isStaleOrFresh && "group",
      )}
    >
      {/* Ambient Image Fade Background */}
      <div
        className={cn(
          "absolute inset-0 z-[-1] pointer-events-none",
          isDisabled && "grayscale opacity-40",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#9a3412]/40 via-[#9a3412]/10 to-transparent mix-blend-screen" />
      </div>

      {/* Refresh Button */}
      {showRefreshButton && (
        <Button
          variant={isStale ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={onRefresh}
          className={cn(
            "absolute top-3 right-3 z-20 bg-black/80",
            isFresh &&
              !isStale &&
              "opacity-0 group-hover:opacity-100 transition-all",
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
            <div className="flex-1 aspect-square bg-white/20 rounded" />
            <div className="flex-1 aspect-square bg-white/20 rounded" />
            <div className="flex-1 aspect-square bg-white/20 rounded" />
          </div>

          {/* Listed Time */}
          <div className="mt-auto flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/60" />
            <p className="text-xs text-white/60">Listed 2m ago</p>
          </div>
        </div>

        {/* Vertical Divider */}
        <Separator
          orientation="vertical"
          className="bg-white/10 relative z-10"
        />

        {/* Middle Column - Details */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          {/* Category Pill */}
          <Badge
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider w-fit mb-2",
              categoryColor,
            )}
          >
            {category}
          </Badge>

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
              {fee} {currency === "divine" ? "Divines" : "Chaos Orbs"}
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
            disabled={isDisabled}
            onClick={onApply}
            variant={isDisabled ? "outline" : "default"}
          >
            {isDisabled ? (
              <>
                <Lock className="size-4" />
                Lobby Started
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

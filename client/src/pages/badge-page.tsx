import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";

interface GemBadge {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  earned: boolean;
  equipped: boolean;
}

const rarityColors = {
  common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  uncommon: "bg-green-500/20 text-green-300 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  legendary: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const playerBadgesQuery = (playerId: number) => ({
  queryKey: ["badges", "player", playerId],
  queryFn: async () => {
    const { data, error } = await api.badges.player[playerId].get();
    if (error) throw error;
    return data as GemBadge[];
  },
  enabled: !!playerId,
});

export function BadgePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const { data: badges = [] } = useQuery(playerBadgesQuery(user?.id || 0));

  const updateEquippedMutation = useMutation({
    mutationFn: async (badgeIds: number[]) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.badges.player[user.id].equipped.put({
        badgeIds,
      });
      if (error) throw error;
      return data as GemBadge[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges", "player"] });
    },
  });

  const selectedBadges = badges.filter((b) => b.equipped).map((b) => b.id);
  const filteredBadges = showEarnedOnly
    ? badges.filter((badge) => badge.earned)
    : badges;

  const handleBadgeClick = (badgeId: number) => {
    const badge = badges.find((b) => b.id === badgeId);
    if (!badge || !badge.earned) return;

    const currentSelected = selectedBadges;
    const existingIndex = currentSelected.indexOf(badgeId);

    let newSelected: number[];
    if (existingIndex !== -1) {
      newSelected = currentSelected.filter((id) => id !== badgeId);
    } else if (currentSelected.length < 3) {
      newSelected = [...currentSelected, badgeId];
    } else {
      newSelected = [...currentSelected.slice(0, 2), badgeId];
    }

    updateEquippedMutation.mutate(newSelected);
  };

  const handleSlotClick = (badgeId: number) => {
    const newSelected = selectedBadges.filter((id) => id !== badgeId);
    updateEquippedMutation.mutate(newSelected);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6 mx-auto max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
        <p className="mt-2 text-muted-foreground">
          Display your earned gems and select up to 3 to show on your profile.
        </p>
      </header>

      {/* Selected Badge Slots */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Equipped Badges</h2>
        <div className="flex gap-4">
          {[0, 1, 2].map((slotIndex) => {
            const badgeId = selectedBadges[slotIndex];
            const badge = badgeId ? badges.find((b) => b.id === badgeId) : null;

            return (
              <button
                key={slotIndex}
                type="button"
                onClick={() => badgeId && handleSlotClick(badgeId)}
                className={cn(
                  "flex-1 h-32 rounded-lg border-2 border-dashed transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  badge
                    ? "border-solid border-primary bg-primary/10"
                    : "border-muted-foreground/25",
                )}
              >
                {badge ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span className="text-4xl">{badge.icon || "🏆"}</span>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
                    <Award className="w-8 h-8" />
                    <span className="text-sm">Empty Slot</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Show Earned Only</h3>
          <p className="text-sm text-muted-foreground">
            Only display badges you have earned
          </p>
        </div>
        <Switch checked={showEarnedOnly} onCheckedChange={setShowEarnedOnly} />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isSelected = selectedBadges.includes(badge.id);
          const isEquippable = badge.earned;

          return (
            <Card
              key={badge.id}
              className={cn(
                "p-4 cursor-pointer transition-all",
                isEquippable ? "hover:border-primary/50" : "opacity-50",
                isSelected && "border-primary bg-primary/10",
              )}
              onClick={() => handleBadgeClick(badge.id)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{badge.icon || "🏆"}</span>
                  <Badge
                    variant="outline"
                    className={cn(rarityColors[badge.rarity])}
                  >
                    {badge.rarity}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {badge.description || "No description"}
                  </p>
                </div>
                {isSelected && <Badge className="w-fit">Equipped</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No badges to display</p>
        </div>
      )}
    </div>
  );
}

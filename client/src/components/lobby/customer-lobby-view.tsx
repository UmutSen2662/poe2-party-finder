import {
  Check,
  Copy,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CurrencyBadge } from "@/components/currency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  Applicant,
  ApplicationStatus,
  PartyFormState,
  PartyStatus,
  RatingVote,
} from "./types";
import { statusBadgeClass } from "./utils";

interface CustomerLobbyViewProps {
  form: PartyFormState;
  applicationStatus: ApplicationStatus;
  partyStatus: PartyStatus;
  applicants: Applicant[];
  onCancelApplication: (partyId: number, playerId: number) => void;
}

export function CustomerLobbyView({
  form,
  applicationStatus,
  partyStatus,
  applicants,
  onCancelApplication,
}: CustomerLobbyViewProps) {
  const [hostRating, setHostRating] = useState<RatingVote>(null);
  const categoryName = "Category Name"; // Will come from server data
  const leagueName = "League Name"; // Will come from server data
  const canCopyWhisper = applicationStatus === "Accepted";
  const canCancel = partyStatus === "Gathering";
  const visibleParticipants = applicants.filter(
    (applicant) =>
      applicant.status === "Accepted" || applicant.status === "Kicked",
  );
  const whisperText = `@HostCarry Hi, I was accepted for your ${form.title} service in ${leagueName}. Fee: ${form.cost} ${form.currencyId}.`;

  const copyWhisper = () => {
    if (!canCopyWhisper) return;
    void navigator.clipboard.writeText(whisperText);
  };

  const handleCancelApplication = () => {
    // Mock party and player IDs - these should come from server state
    onCancelApplication(1, 1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="size-5" />
            Active Application
          </CardTitle>
          <CardDescription>
            Read-only dashboard for the party you applied to.
          </CardDescription>
          <CardAction>
            <Badge className={statusBadgeClass(applicationStatus)}>
              {applicationStatus}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-[#111] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="bg-orange-500/20 text-orange-300">
                  {categoryName}
                </Badge>
                <h2 className="text-2xl font-bold text-white">{form.title}</h2>
                <p className="text-sm text-zinc-400">
                  Hosted by HostCarry in {leagueName}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-right">
                <div className="text-xs text-zinc-400">Cost</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                  {form.cost}
                  <CurrencyBadge
                    currency={
                      form.currencyId === 1
                        ? "divine"
                        : form.currencyId === 2
                          ? "chaos"
                          : "divine"
                    }
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
            <Separator className="my-5 bg-white/10" />
            <p className="whitespace-pre-line text-sm leading-6 text-zinc-200">
              {form.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {["Pending", "Accepted", "Rejected", "Kicked"].map(
              (status, index) => {
                const statuses = ["Pending", "Accepted", "Rejected", "Kicked"];
                const activeIndex = statuses.indexOf(applicationStatus);
                const isActive = status === applicationStatus;
                const isPast =
                  index < activeIndex &&
                  applicationStatus !== "Rejected" &&
                  applicationStatus !== "Kicked";

                return (
                  <div
                    key={status}
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      isActive && statusBadgeClass(status),
                      isPast &&
                        "border-green-500/30 bg-green-500/10 text-green-300",
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {isPast ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="size-2 rounded-full bg-current" />
                      )}
                      {status}
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <Card className="bg-background/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Party Members
              </CardTitle>
              <CardDescription>
                Visible accepted and kicked players for this mock run.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">HostCarry</div>
                  <div className="text-sm text-muted-foreground">Host</div>
                </div>
                <Badge variant="outline">Host</Badge>
              </div>
              {visibleParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{participant.ign}</div>
                    <div className="text-sm text-muted-foreground">
                      Customer rating {participant.customerRating}
                    </div>
                  </div>
                  <Badge className={statusBadgeClass(participant.status)}>
                    {participant.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <Button
            variant="outline"
            disabled={!canCancel}
            onClick={handleCancelApplication}
          >
            Cancel Application
          </Button>
          <Button disabled={!canCopyWhisper} onClick={copyWhisper}>
            <Copy className="size-4" />
            Copy Whisper
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-5" />
              End-of-Run Vote
            </CardTitle>
            <CardDescription>
              Customers can rate the host after the party ends.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-background/40 p-3">
              <div className="font-medium">HostCarry</div>
              <div className="text-sm text-muted-foreground">
                Host rating target
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={hostRating === "up" ? "default" : "outline"}
                disabled={partyStatus !== "Ended"}
                onClick={() => setHostRating("up")}
                className="flex-1"
              >
                <ThumbsUp className="size-4" />
                Up
              </Button>
              <Button
                variant={hostRating === "down" ? "destructive" : "outline"}
                disabled={partyStatus !== "Ended"}
                onClick={() => setHostRating("down")}
                className="flex-1"
              >
                <ThumbsDown className="size-4" />
                Down
              </Button>
            </div>
            {partyStatus !== "Ended" && (
              <p className="text-sm text-muted-foreground">
                Voting unlocks when the party status becomes Ended.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

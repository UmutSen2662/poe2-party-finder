import { AlertCircle, Check, Clock, Copy, Shield, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CurrencyBadge } from "@/components/currency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { RatingDialog } from "./rating-dialog";
import type { ApplicationStatus, PartyStatus } from "./types";

interface CustomerLobbyViewProps {
  partyId: number;
  partyTitle: string;
  partyDescription?: string;
  categoryDisplayName: string;
  leagueName: string;
  hostId: number;
  hostIgn: string;
  hostRating: number;
  cost: number;
  currencyName: string;
  currencyIcon?: string | null;
  applicationStatus: ApplicationStatus;
  partyStatus: PartyStatus;
  hasRated: boolean;
  onCancelApplication: (partyId: number, playerId: number) => void;
  onSubmitRating: (
    giverId: number,
    receiverId: number,
    partyId: number,
    value: 1 | -1,
  ) => void;
}

export function CustomerLobbyView({
  partyId,
  partyTitle,
  partyDescription,
  categoryDisplayName,
  leagueName,
  hostId,
  hostIgn,
  hostRating,
  cost,
  currencyName,
  currencyIcon,
  applicationStatus,
  partyStatus,
  hasRated,
  onCancelApplication,
  onSubmitRating,
}: CustomerLobbyViewProps) {
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const canCopyWhisper = applicationStatus === "Accepted";
  const canCancel =
    partyStatus === "Gathering" && applicationStatus === "Pending";
  const whisperText = `@${hostIgn} Hi, I was accepted for your ${partyTitle} service in ${leagueName}. Fee: ${cost} ${currencyName}.`;

  // Open rating dialog when party ends and application was accepted
  useEffect(() => {
    if (
      partyStatus === "Ended" &&
      applicationStatus === "Accepted" &&
      !hasRated
    ) {
      setRatingDialogOpen(true);
    }
  }, [partyStatus, applicationStatus, hasRated]);

  const copyWhisper = () => {
    if (!canCopyWhisper) return;
    void navigator.clipboard.writeText(whisperText);
  };

  const handleCancelApplication = () => {
    onCancelApplication(partyId, user?.id || 0);
  };

  const handleRatingSubmit = (value: 1 | -1) => {
    onSubmitRating(user?.id || 0, hostId, partyId, value);
    setRatingDialogOpen(false);
  };

  // Rejected/Kicked fallback state
  if (applicationStatus === "Rejected" || applicationStatus === "Kicked") {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full border-destructive/30 bg-destructive/10 p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Application {applicationStatus}
              </h2>
              <p className="text-sm text-muted-foreground">
                Your application was {applicationStatus.toLowerCase()}. You can
                search for other parties.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* View Header */}
      <h1 className="text-2xl font-bold text-foreground">Active Application</h1>

      {/* Dynamic Status Banner */}
      {applicationStatus === "Accepted" ? (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-4 rounded-lg border border-green-500/30 bg-green-950/30 p-5">
          <div className="mb-4 sm:mb-0 flex items-center gap-2">
            <Check className="size-5 text-green-400" />
            <div>
              <h2 className="text-lg font-bold text-green-400">
                Application Accepted!
              </h2>
              <p className="text-sm text-foreground">
                The host is ready for you. Copy the whisper message below to
                contact them in-game.
              </p>
            </div>
          </div>
          <Button
            onClick={copyWhisper}
            className="w-full sm:w-auto sm:min-w-[140px]"
          >
            <Copy className="mr-2 size-4" />
            Copy Whisper
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/50 p-5">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              Waiting for Host
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You are in the queue. The host will review your application.
          </p>
        </div>
      )}

      {/* Party Details Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 space-y-4">
          {/* Top Row: Category & Fee */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="text-xs font-bold uppercase"
              >
                {categoryDisplayName}
              </Badge>
              <h2 className="text-xl font-bold text-foreground">
                {partyTitle}
              </h2>
            </div>
            <div className="rounded-md border border-border bg-background/50 px-3 py-2">
              <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                {cost}{" "}
                <CurrencyBadge
                  currency={{
                    name: currencyName,
                    icon: currencyIcon ?? null,
                  }}
                  showLabel={true}
                />
              </div>
            </div>
          </div>

          {/* Host Info Block */}
          <div className="inline-flex rounded-md border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Hosted By
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{hostIgn}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Rating
                </p>
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-green-400 fill-green-400" />
                  <span className="font-medium text-green-400">
                    {hostRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <Separator />

          {/* Description */}
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {partyDescription}
          </p>
        </CardContent>
      </Card>

      {/* Secondary Actions - Cancel Application */}
      {canCancel && (
        <Button
          variant="outline"
          onClick={handleCancelApplication}
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <X className="mr-2 size-4" />
          Cancel Application
        </Button>
      )}

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        title="Rate Your Host"
        description={`How was your experience with ${hostIgn}?`}
        targets={[
          {
            id: hostId,
            ign: hostIgn,
            rating: hostRating,
          },
        ]}
        onSubmitRating={(_, value) => {
          handleRatingSubmit(value);
        }}
        submittedRatings={hasRated ? new Set([String(hostId)]) : new Set()}
        onCloseLabel="Close"
        closeDisabled={false}
      />
    </div>
  );
}

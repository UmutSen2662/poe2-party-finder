import { AlertCircle, Check, Clock, Copy, Shield, Star, X } from "lucide-react";
import { CurrencyBadge } from "@/components/currency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import type { ApplicationStatus, PartyFormState, PartyStatus } from "./types";

interface CustomerLobbyViewProps {
  form: PartyFormState;
  partyId: number;
  partyTitle: string;
  partyDescription?: string;
  categoryDisplayName: string;
  leagueName: string;
  hostIgn: string;
  hostRating: number;
  cost: number;
  currencyName: string;
  currencyIcon?: string | null;
  applicationStatus: ApplicationStatus;
  partyStatus: PartyStatus;
  onCancelApplication: (partyId: number, playerId: number) => void;
}

export function CustomerLobbyView({
  form,
  partyId,
  partyTitle,
  partyDescription,
  categoryDisplayName,
  leagueName,
  hostIgn,
  hostRating: hostRatingProp,
  cost,
  currencyName,
  currencyIcon,
  applicationStatus,
  partyStatus,
  onCancelApplication,
}: CustomerLobbyViewProps) {
  const { user } = useAuth();
  const canCopyWhisper = applicationStatus === "Accepted";
  const canCancel =
    partyStatus === "Gathering" && applicationStatus === "Pending";
  const whisperText = `@${hostIgn} Hi, I was accepted for your ${partyTitle} service in ${leagueName}. Fee: ${cost} ${currencyName}.`;

  const copyWhisper = () => {
    if (!canCopyWhisper) return;
    void navigator.clipboard.writeText(whisperText);
  };

  const handleCancelApplication = () => {
    onCancelApplication(partyId, user?.id || 0);
  };

  // Rejected/Kicked fallback state
  if (applicationStatus === "Rejected" || applicationStatus === "Kicked") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full border-red-500/30 bg-red-950/20 p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-red-500/20 p-4">
              <AlertCircle className="size-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Application {applicationStatus}
              </h2>
              <p className="text-sm text-zinc-400">
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
      <h1 className="text-2xl font-bold text-white">Active Application</h1>

      {/* Dynamic Status Banner */}
      {applicationStatus === "Accepted" ? (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-4 rounded-lg border border-green-500/30 bg-green-950/30 p-5">
          <div className="mb-4 sm:mb-0 flex items-center gap-2">
            <Check className="size-5 text-green-400" />
            <div>
              <h2 className="text-lg font-bold text-green-400">
                Application Accepted!
              </h2>
              <p className="text-sm text-zinc-300">
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
        <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-300">
              Waiting for Host
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            You are in the queue. The host will review your application.
          </p>
        </div>
      )}

      {/* Party Details Card */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-5 space-y-4">
          {/* Top Row: Category & Fee */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge className="bg-orange-500/20 text-orange-300 text-xs font-bold uppercase">
                {categoryDisplayName}
              </Badge>
              <h2 className="text-xl font-bold text-white">{partyTitle}</h2>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
              <div className="flex items-center gap-2 text-base font-semibold text-white">
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
          <div className="inline-flex rounded-md border border-white/10 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  Hosted By
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-zinc-400" />
                  <span className="font-medium text-white">{hostIgn}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  Rating
                </p>
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-green-400 fill-green-400" />
                  <span className="font-medium text-green-400">
                    {hostRatingProp.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <Separator className="bg-white/10" />

          {/* Description */}
          <p className="whitespace-pre-line text-sm leading-6 text-zinc-400">
            {partyDescription || form.description}
          </p>
        </CardContent>
      </Card>

      {/* Secondary Actions - Cancel Application */}
      {canCancel && (
        <Button
          variant="outline"
          onClick={handleCancelApplication}
          className="w-full border-red-500/50 text-red-400 hover:bg-red-950/20 hover:text-red-300"
        >
          <X className="mr-2 size-4" />
          Cancel Application
        </Button>
      )}
    </div>
  );
}

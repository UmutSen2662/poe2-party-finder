import {
  Crown,
  Play,
  Square,
  Star,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { RatingDialog } from "./rating-dialog";
import type { Applicant, ApplicationStatus, PartyStatus } from "./types";
import { statusBadgeClass } from "./utils";

interface HostLobbyViewProps {
  capacity: string;
  partyId: number;
  partyTitle: string;
  partyDescription?: string;
  partyStatus: PartyStatus;
  applicants: Applicant[];
  submittedRatings: Set<string>;
  onStartParty: (partyId: number) => void;
  onEndParty: (partyId: number) => void;
  onCancelParty: (partyId: number) => void;
  onUpdateApplicantStatus: (
    partyId: number,
    playerId: number,
    status: "Pending" | "Accepted" | "Rejected" | "Kicked",
  ) => void;
  onSubmitRating: (
    giverId: number,
    receiverId: number,
    partyId: number,
    value: 1 | -1,
  ) => void;
}

function ConfirmAction({
  title,
  description,
  actionLabel,
  actionVariant = "default",
  disabled,
  triggerIcon,
  triggerLabel,
  triggerVariant = "outline",
  onConfirm,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?: "default" | "destructive";
  disabled?: boolean;
  triggerIcon: React.ReactNode;
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "destructive";
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={disabled}
        className={buttonVariants({ variant: triggerVariant })}
      >
        {triggerIcon}
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              actionVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function HostLobbyView({
  capacity,
  partyId,
  partyTitle,
  partyDescription,
  partyStatus,
  applicants,
  submittedRatings,
  onStartParty,
  onEndParty,
  onCancelParty,
  onUpdateApplicantStatus,
  onSubmitRating,
}: HostLobbyViewProps) {
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const acceptedCount = applicants.filter(
    (applicant) => applicant.status === "Accepted",
  ).length;
  const ratingTargets = applicants.filter(
    (applicant) =>
      applicant.status === "Accepted" || applicant.status === "Kicked",
  );

  const handleStartParty = () => {
    onStartParty(partyId);
  };

  const handleEndParty = () => {
    onEndParty(partyId);
    setRatingDialogOpen(true);
  };

  const handleCancelParty = () => {
    onCancelParty(partyId);
  };

  const handleUpdateApplicantStatus = (
    applicantId: string,
    status: ApplicationStatus,
  ) => {
    onUpdateApplicantStatus(partyId, Number(applicantId), status);
  };

  const handleSubmitRating = (applicantId: string, value: 1 | -1) => {
    onSubmitRating(user?.id || 0, Number(applicantId), partyId, value);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="size-5" />
                  Host Controls
                </CardTitle>
                <CardDescription>
                  Manage the lobby lifecycle with confirmation for critical
                  actions.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusBadgeClass(partyStatus)}>
                  {partyStatus}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Users className="size-3" />
                  {acceptedCount} / {capacity} accepted
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-foreground">
                  {partyTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {partyDescription || "No description"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ConfirmAction
                  title="Start party?"
                  description="This will lock the lobby and remove it from live search. Customers should be ready before you continue."
                  actionLabel="Start Party"
                  disabled={partyStatus !== "Gathering"}
                  triggerIcon={<Play className="size-4" />}
                  triggerLabel="Start"
                  triggerVariant={
                    partyStatus === "Started" ? "default" : "outline"
                  }
                  onConfirm={handleStartParty}
                />
                <ConfirmAction
                  title="End party?"
                  description="This will close the lobby and open the post-run rating phase. Make sure the run is actually complete."
                  actionLabel="End Party"
                  disabled={partyStatus === "Ended"}
                  triggerIcon={<Square className="size-4" />}
                  triggerLabel="End"
                  triggerVariant={
                    partyStatus === "Ended" ? "default" : "outline"
                  }
                  onConfirm={handleEndParty}
                />
                <ConfirmAction
                  title="Cancel lobby?"
                  description="This will delete the active lobby before starting. Applicants will lose access to this session."
                  actionLabel="Cancel Lobby"
                  actionVariant="destructive"
                  disabled={partyStatus !== "Gathering"}
                  triggerIcon={<X className="size-4" />}
                  triggerLabel="Cancel"
                  triggerVariant="destructive"
                  onConfirm={handleCancelParty}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Applicant Queue</CardTitle>
            <CardDescription>
              Ordered chronologically by application time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex flex-col gap-4 rounded-xl border bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                    {applicant.ign.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{applicant.ign}</h3>
                      <Badge className={statusBadgeClass(applicant.status)}>
                        {applicant.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="size-4 text-green-400" />
                        {applicant.customerRating}
                      </span>
                      <span className="whitespace-nowrap">
                        Applied {applicant.appliedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateApplicantStatus(applicant.id, "Accepted")
                    }
                    disabled={applicant.status === "Accepted"}
                  >
                    <UserPlus className="size-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdateApplicantStatus(applicant.id, "Rejected")
                    }
                    disabled={applicant.status === "Rejected"}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleUpdateApplicantStatus(applicant.id, "Kicked")
                    }
                    disabled={applicant.status === "Kicked"}
                  >
                    <UserMinus className="size-4" />
                    Kick
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        title="Post-Run Ratings"
        description="Rate all accepted or kicked customers from this run."
        targets={ratingTargets.map((applicant) => ({
          id: Number(applicant.id),
          ign: applicant.ign,
          status: applicant.status,
        }))}
        onSubmitRating={(targetId, value) => {
          handleSubmitRating(String(targetId), value);
        }}
        submittedRatings={submittedRatings}
      />
    </>
  );
}

import {
  Crown,
  Play,
  Square,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Applicant,
  ApplicationStatus,
  PartyFormState,
  PartyStatus,
  RatingVote,
} from "./types";
import { statusBadgeClass } from "./utils";

interface HostLobbyViewProps {
  form: PartyFormState;
  partyStatus: PartyStatus;
  setPartyStatus: (status: PartyStatus) => void;
  applicants: Applicant[];
  setApplicants: Dispatch<SetStateAction<Applicant[]>>;
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
                ? "bg-destructive text-white hover:bg-destructive/90"
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
  form,
  partyStatus,
  setPartyStatus,
  applicants,
  setApplicants,
}: HostLobbyViewProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, RatingVote>>({});
  const acceptedCount = applicants.filter(
    (applicant) => applicant.status === "Accepted",
  ).length;
  const ratingTargets = applicants.filter(
    (applicant) =>
      applicant.status === "Accepted" || applicant.status === "Kicked",
  );

  const updateApplicant = (id: string, status: ApplicationStatus) => {
    setApplicants((current) =>
      current.map((applicant) =>
        applicant.id === id ? { ...applicant, status } : applicant,
      ),
    );
  };

  const handleEnded = () => {
    setPartyStatus("Ended");
    setRatingDialogOpen(true);
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
                  {acceptedCount} / {form.capacity} accepted
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-xl border bg-[#111] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">
                  {form.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Start locks search visibility. End opens post-run ratings.
                  Cancel removes the lobby before the run.
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
                  onConfirm={() => setPartyStatus("Started")}
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
                  onConfirm={handleEnded}
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
                  onConfirm={() => setPartyStatus("Ended")}
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
                        {applicant.customerRating} customer rating
                      </span>
                      <span>Applied {applicant.appliedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateApplicant(applicant.id, "Accepted")}
                    disabled={applicant.status === "Accepted"}
                  >
                    <UserPlus className="size-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateApplicant(applicant.id, "Rejected")}
                    disabled={applicant.status === "Rejected"}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateApplicant(applicant.id, "Kicked")}
                    disabled={
                      partyStatus === "Gathering" ||
                      applicant.status === "Kicked"
                    }
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

      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post-Run Ratings</DialogTitle>
            <DialogDescription>
              Rate all accepted or kicked customers from this run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {ratingTargets.map((applicant) => (
              <div
                key={applicant.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{applicant.ign}</div>
                  <div className="text-sm text-muted-foreground">
                    Final status: {applicant.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={
                      ratings[applicant.id] === "up" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() =>
                      setRatings((current) => ({
                        ...current,
                        [applicant.id]: "up",
                      }))
                    }
                  >
                    <ThumbsUp className="size-4" />
                  </Button>
                  <Button
                    variant={
                      ratings[applicant.id] === "down"
                        ? "destructive"
                        : "outline"
                    }
                    size="icon"
                    onClick={() =>
                      setRatings((current) => ({
                        ...current,
                        [applicant.id]: "down",
                      }))
                    }
                  >
                    <ThumbsDown className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {ratingTargets.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No accepted or kicked customers to rate yet.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setRatingDialogOpen(false)}>
              Submit Ratings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

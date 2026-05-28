import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface UnvotedParty {
  partyId: number;
  partyTitle: string;
  role: "host" | "customer";
  targets: Array<{
    id: number;
    ign: string;
  }>;
}

interface UnvotedRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unvotedParties: UnvotedParty[];
  userId: number;
  onSubmitRating: (
    giverId: number,
    receiverId: number,
    partyId: number,
    value: 1 | -1,
  ) => void;
}

export function UnvotedRatingsDialog({
  open,
  onOpenChange,
  unvotedParties,
  userId,
  onSubmitRating,
}: UnvotedRatingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pending Ratings</DialogTitle>
          <DialogDescription>
            You have {unvotedParties.length} party(s) that need your rating.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {unvotedParties.map((party) => (
            <div
              key={party.partyId}
              className="rounded-lg border p-4 space-y-3"
            >
              <div>
                <div className="font-semibold">{party.partyTitle}</div>
                <div className="text-sm text-muted-foreground">
                  You were the {party.role}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Rate:</div>
                {party.targets.map((target) => (
                  <div
                    key={target.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm">{target.ign}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSubmitRating(userId, target.id, party.partyId, 1);
                        }}
                      >
                        Positive
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onSubmitRating(userId, target.id, party.partyId, -1);
                        }}
                      >
                        Negative
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {unvotedParties.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No pending ratings
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

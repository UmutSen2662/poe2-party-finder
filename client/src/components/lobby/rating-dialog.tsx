import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RatingTarget {
  id: number;
  ign: string;
  rating?: number;
  status?: string;
}

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  targets: RatingTarget[];
  onSubmitRating: (targetId: number, value: 1 | -1) => void;
  submittedRatings?: Set<string>;
  onCloseLabel?: string;
  closeDisabled?: boolean;
}

export function RatingDialog({
  open,
  onOpenChange,
  title,
  description,
  targets,
  onSubmitRating,
  submittedRatings = new Set(),
  onCloseLabel,
  closeDisabled = false,
}: RatingDialogProps) {
  const allRatingsSubmitted = targets.every((target) =>
    submittedRatings.has(String(target.id)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {targets.map((target) => (
            <div
              key={target.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                  {target.ign.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{target.ign}</div>
                  {target.status && (
                    <div className="text-sm text-muted-foreground">
                      Status: {target.status}
                    </div>
                  )}
                  {target.rating !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-4 text-green-400" />
                      {target.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSubmitRating(target.id, 1)}
                >
                  <ThumbsUp className="size-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onSubmitRating(target.id, -1)}
                >
                  <ThumbsDown className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {targets.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No one to rate
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} disabled={closeDisabled}>
            {onCloseLabel ||
              (!allRatingsSubmitted
                ? `Rate ${targets.length - submittedRatings.size} more to close`
                : "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

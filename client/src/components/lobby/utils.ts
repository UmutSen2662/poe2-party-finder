import type { ApplicationStatus, PartyStatus } from "./types";

export function statusBadgeClass(status: PartyStatus | ApplicationStatus) {
  switch (status) {
    case "Gathering":
    case "Pending":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Started":
    case "Accepted":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Ended":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "Rejected":
    case "Kicked":
      return "bg-destructive/20 text-destructive border-destructive/30";
  }
}

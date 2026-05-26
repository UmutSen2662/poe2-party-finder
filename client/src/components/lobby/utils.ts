import type { ApplicationStatus, PartyStatus } from "./types";

export function statusBadgeClass(status: PartyStatus | ApplicationStatus) {
  switch (status) {
    case "Gathering":
    case "Pending":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "Started":
    case "Accepted":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Ended":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "Rejected":
    case "Kicked":
      return "bg-red-500/20 text-red-300 border-red-500/30";
  }
}

export function fieldLabelById(
  options: { id: string; name: string }[],
  id: string,
  fallback: string,
) {
  return options.find((option) => option.id === id)?.name ?? fallback;
}

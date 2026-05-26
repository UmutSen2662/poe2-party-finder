export type PublicStatus = "Active" | "Inactive";
export type DbStatus = "active" | "inactive";

export type PublicPartyStatus = "Gathering" | "Started" | "Ended";
export type DbPartyStatus = "gathering" | "started" | "ended";

export type PublicApplicationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Kicked";
export type DbApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "kicked";

export const toPublicStatus = (status: DbStatus): PublicStatus =>
  status === "active" ? "Active" : "Inactive";

export const fromPublicStatus = (status: PublicStatus): DbStatus =>
  status === "Active" ? "active" : "inactive";

export const toPublicPartyStatus = (
  status: DbPartyStatus,
): PublicPartyStatus => {
  switch (status) {
    case "gathering":
      return "Gathering";
    case "started":
      return "Started";
    case "ended":
      return "Ended";
  }
};

export const fromPublicPartyStatus = (
  status: PublicPartyStatus,
): DbPartyStatus => {
  switch (status) {
    case "Gathering":
      return "gathering";
    case "Started":
      return "started";
    case "Ended":
      return "ended";
  }
};

export const toPublicApplicationStatus = (
  status: DbApplicationStatus,
): PublicApplicationStatus => {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "kicked":
      return "Kicked";
  }
};

export const fromPublicApplicationStatus = (
  status: PublicApplicationStatus,
): DbApplicationStatus => {
  switch (status) {
    case "Pending":
      return "pending";
    case "Accepted":
      return "accepted";
    case "Rejected":
      return "rejected";
    case "Kicked":
      return "kicked";
  }
};

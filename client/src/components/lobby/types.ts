export type LobbyView = "create" | "customer" | "host";
export type CurrencyId = "divine" | "chaos";
export type PartyStatus = "Gathering" | "Started" | "Ended";
export type ApplicationStatus = "Pending" | "Accepted" | "Rejected" | "Kicked";
export type RatingVote = "up" | "down" | null;

export interface PartyFormState {
  title: string;
  description: string;
  capacity: string;
  cost: string;
  leagueId: string;
  categoryId: string;
  currencyId: CurrencyId;
}

export interface Template {
  id: string;
  name: string;
  data: PartyFormState;
}

export interface Applicant {
  id: string;
  ign: string;
  customerRating: number;
  appliedAt: string;
  status: ApplicationStatus;
}

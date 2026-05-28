import type {
  PublicApplicationStatus,
  PublicPartyStatus,
} from "@poe2-party-finder/server/src/routes/lobby/lobby.service";

export type PartyStatus = PublicPartyStatus;
export type ApplicationStatus = PublicApplicationStatus;
export type RatingVote = "up" | "down" | null;

export interface PartyFormState {
  title: string;
  description: string;
  capacity: string;
  cost: string;
  leagueId: number | null;
  categoryId: number | null;
  currencyId: number;
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

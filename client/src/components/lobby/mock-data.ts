import type {
  Applicant,
  ApplicationStatus,
  CurrencyId,
  PartyFormState,
  Template,
} from "./types";

export const activeLeagues = [
  { id: "league-1", name: "Fate of the Vaal" },
  { id: "league-2", name: "Standard" },
];

export const activeCategories = [
  {
    id: "category-1",
    name: "Vaal Temple",
    color: "bg-orange-500/20 text-orange-300",
  },
  {
    id: "category-2",
    name: "Boss Carry",
    color: "bg-red-500/20 text-red-300",
  },
  {
    id: "category-3",
    name: "Waystone Rotas",
    color: "bg-blue-500/20 text-blue-300",
  },
];

export const currencies: { id: CurrencyId; name: string }[] = [
  { id: "divine", name: "Divine Orb" },
  { id: "chaos", name: "Chaos Orb" },
];

export const initialFormState: PartyFormState = {
  title: "Vaal Temple carry - fast clear",
  description:
    "Rules: stay near entrance until called, no ninja looting, all boss fragments reserved. Payment upfront after invite.",
  capacity: "5",
  cost: "30",
  leagueId: "league-1",
  categoryId: "category-1",
  currencyId: "divine",
};

export const initialTemplates: Template[] = [
  {
    id: "template-1",
    name: "Vaal Temple Carry",
    data: initialFormState,
  },
  {
    id: "template-2",
    name: "Boss Kill Service",
    data: {
      title: "Pinnacle boss carry",
      description:
        "Bring your set, wait for ready check, enter only when instructed. Completion guaranteed or fee refunded.",
      capacity: "3",
      cost: "80",
      leagueId: "league-1",
      categoryId: "category-2",
      currencyId: "divine",
    },
  },
];

export const initialApplicants: Applicant[] = [
  {
    id: "applicant-1",
    ign: "MapRunnerPrime",
    customerRating: 9.2,
    appliedAt: "10:12",
    status: "Pending",
  },
  {
    id: "applicant-2",
    ign: "ChaosBuyer",
    customerRating: 8.7,
    appliedAt: "10:14",
    status: "Accepted",
  },
  {
    id: "applicant-3",
    ign: "ExileNova",
    customerRating: 7.9,
    appliedAt: "10:17",
    status: "Pending",
  },
];

export const applicationStatuses: ApplicationStatus[] = [
  "Pending",
  "Accepted",
  "Rejected",
  "Kicked",
];

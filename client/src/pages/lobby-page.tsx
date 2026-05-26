import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { CreatePartyView } from "@/components/lobby/create-party-view";
import { CustomerLobbyView } from "@/components/lobby/customer-lobby-view";
import { HostLobbyView } from "@/components/lobby/host-lobby-view";
import type {
  ApplicationStatus,
  PartyFormState,
  PartyStatus,
} from "@/components/lobby/types";
import { statusBadgeClass } from "@/components/lobby/utils";
import { Badge } from "@/components/ui/badge";
import { api, assetUrl } from "@/lib/eden";

// Mock player ID - this should come from auth/session in production
const MOCK_PLAYER_ID = 1;

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await api.categories.get();
    if (error) throw error;
    return data;
  },
});

const leaguesQuery = queryOptions({
  queryKey: ["leagues", { activeOnly: true }],
  queryFn: async () => {
    const { data, error } = await api.leagues.get({
      $query: { activeOnly: true },
    });
    if (error) throw error;
    return data;
  },
});

const currenciesQuery = queryOptions({
  queryKey: ["currencies"],
  queryFn: async () => {
    const { data, error } = await api.currencies.get();
    if (error) throw error;
    return data;
  },
});

const lobbyStateQuery = queryOptions({
  queryKey: ["lobby", "state"],
  queryFn: async () => {
    const { data, error } = await api.lobby.state.get({
      $query: { playerId: MOCK_PLAYER_ID },
    });
    if (error) throw error;
    return data;
  },
});

const templatesQuery = queryOptions({
  queryKey: ["lobby", "templates"],
  queryFn: async () => {
    const { data, error } = await api.lobby.templates.get({
      $query: { playerId: MOCK_PLAYER_ID },
    });
    if (error) throw error;
    return data;
  },
});

function applicantsQuery(partyId: number) {
  return queryOptions({
    queryKey: ["lobby", "applicants", partyId],
    queryFn: async () => {
      const { data, error } = await api.parties[partyId].applications.get({
        $query: { hostId: MOCK_PLAYER_ID },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function LobbyPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PartyFormState>({
    title: "",
    description: "",
    capacity: "1",
    cost: "0",
    leagueId: null,
    categoryId: null,
    currencyId: 1,
  });

  // Fetch lookup data
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: leagues } = useSuspenseQuery(leaguesQuery);
  const { data: currencies } = useSuspenseQuery(currenciesQuery);

  // Fetch lobby state
  const { data: lobbyState } = useQuery(lobbyStateQuery);

  // Fetch templates
  const { data: serverTemplates } = useQuery(templatesQuery);

  // Fetch applicants when in host mode
  const partyId = lobbyState?.kind === "host" ? lobbyState.party.id : undefined;
  const { data: applicants } = useQuery({
    ...applicantsQuery(partyId || 0),
    enabled: partyId !== undefined,
  });

  // Normalize data for components
  const normalizedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    imagePath: category.image,
  }));

  const normalizedLeagues = leagues.map((league) => ({
    id: league.id,
    name: league.name,
  }));

  const normalizedCurrencies = currencies.map((currency) => ({
    id: currency.id,
    name: currency.name,
    icon: assetUrl(currency.icon),
  }));

  const normalizedTemplates = (serverTemplates || []).map(
    (template, index) => ({
      id: `template-${index}`,
      name: template.name,
      data: {
        title: template.title || "",
        description: template.description || "",
        capacity: template.capacity?.toString() || "1",
        cost: template.cost?.toString() || "0",
        leagueId: template.leagueId || null,
        categoryId: template.categoryId || null,
        currencyId: template.currencyId || 1,
      } as PartyFormState,
    }),
  );

  // Derive state from server data
  const partyStatus: PartyStatus =
    lobbyState?.kind === "host"
      ? (lobbyState.party.status as PartyStatus)
      : "Gathering";

  const applicationStatus: ApplicationStatus =
    lobbyState?.kind === "customer"
      ? (lobbyState.application.status as ApplicationStatus)
      : "Pending";

  const normalizedApplicants = (applicants || []).map((applicant) => {
    const status: ApplicationStatus = applicant.status as ApplicationStatus;
    return {
      id: String(applicant.playerId),
      ign: applicant.ign,
      customerRating: applicant.customerRating,
      appliedAt: new Date(applicant.appliedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status,
    };
  });

  // Mutations
  const createPartyMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      capacity: number;
      cost: number;
      leagueId: number;
      categoryId: number;
      currencyId: number;
    }) => {
      const { data, error } = await api.parties.post({
        ...payload,
        hostId: MOCK_PLAYER_ID,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const updatePartyStatusMutation = useMutation({
    mutationFn: async ({
      partyId,
      status,
    }: {
      partyId: number;
      status: "Gathering" | "Started" | "Ended";
    }) => {
      const { data, error } = await api.parties[partyId].status.put({
        status,
        hostId: MOCK_PLAYER_ID,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const cancelPartyMutation = useMutation({
    mutationFn: async (partyId: number) => {
      const { data, error } = await api.parties[partyId].delete({
        $query: { hostId: MOCK_PLAYER_ID },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({
      partyId,
      playerId,
      status,
    }: {
      partyId: number;
      playerId: number;
      status: "Pending" | "Accepted" | "Rejected" | "Kicked";
    }) => {
      const { data, error } = await api.applications[partyId][
        playerId
      ].status.put({
        status,
        hostId: MOCK_PLAYER_ID,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { partyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["lobby", "applicants", partyId],
      });
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
    },
  });

  const cancelApplicationMutation = useMutation({
    mutationFn: async ({
      partyId,
      playerId,
    }: {
      partyId: number;
      playerId: number;
    }) => {
      const { data, error } = await api.applications[partyId][playerId].delete({
        $query: { requesterPlayerId: MOCK_PLAYER_ID },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
    },
  });

  const submitRatingMutation = useMutation({
    mutationFn: async ({
      giverId,
      receiverId,
      partyId,
      value,
    }: {
      giverId: number;
      receiverId: number;
      partyId: number;
      value: 1 | -1;
    }) => {
      const { data, error } = await api.ratings.post({
        giverId,
        receiverId,
        partyId,
        value,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateIndex: number) => {
      const { data, error } = await api.lobby.templates[templateIndex].delete({
        $query: { playerId: MOCK_PLAYER_ID },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "templates"] });
    },
  });

  // Determine view based on lobby state (fully server-driven)
  const activeView =
    lobbyState?.kind === "host"
      ? "host"
      : lobbyState?.kind === "customer"
        ? "customer"
        : "create";

  const activeViewLabel =
    activeView === "create"
      ? "Empty / Create Party View"
      : activeView === "customer"
        ? "Customer View"
        : "Host View";

  const saveTemplate = async () => {
    const { error } = await api.lobby.templates.post({
      $query: { playerId: MOCK_PLAYER_ID },
      name: form.title || "Untitled Template",
      text: form.description,
      title: form.title,
      description: form.description,
      capacity: Number(form.capacity),
      cost: Number(form.cost),
      leagueId: form.leagueId || undefined,
      categoryId: form.categoryId || undefined,
      currencyId: form.currencyId,
    });
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["lobby", "templates"] });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6 mx-auto max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Lobby</h1>
        <p className="mt-2 text-muted-foreground">
          Unified active-session hub for creating, joining, and managing
          parties.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{activeViewLabel}</Badge>
        {lobbyState?.kind !== "empty" && (
          <Badge className={statusBadgeClass(partyStatus)}>
            Party: {partyStatus}
          </Badge>
        )}
      </div>

      {activeView === "create" && (
        <CreatePartyView
          form={form}
          setForm={setForm}
          templates={normalizedTemplates}
          categories={normalizedCategories}
          leagues={normalizedLeagues}
          currencies={normalizedCurrencies}
          onSaveTemplate={saveTemplate}
          onDeleteTemplate={(index) => deleteTemplateMutation.mutate(index)}
          onCreateParty={(payload) => createPartyMutation.mutate(payload)}
        />
      )}
      {activeView === "customer" && (
        <CustomerLobbyView
          form={form}
          applicationStatus={applicationStatus}
          partyStatus={partyStatus}
          applicants={normalizedApplicants}
          onCancelApplication={(partyId, playerId) =>
            cancelApplicationMutation.mutate({ partyId, playerId })
          }
        />
      )}
      {activeView === "host" && (
        <HostLobbyView
          form={form}
          partyStatus={partyStatus}
          applicants={normalizedApplicants}
          onStartParty={(partyId) =>
            updatePartyStatusMutation.mutate({ partyId, status: "Started" })
          }
          onEndParty={(partyId) =>
            updatePartyStatusMutation.mutate({ partyId, status: "Ended" })
          }
          onCancelParty={(partyId) => cancelPartyMutation.mutate(partyId)}
          onUpdateApplicantStatus={(partyId, playerId, status) =>
            updateApplicationStatusMutation.mutate({
              partyId,
              playerId,
              status,
            })
          }
          onSubmitRating={(giverId, receiverId, partyId, value) =>
            submitRatingMutation.mutate({ giverId, receiverId, partyId, value })
          }
        />
      )}
    </div>
  );
}

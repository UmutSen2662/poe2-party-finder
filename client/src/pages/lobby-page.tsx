import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CreatePartyView } from "@/components/lobby/create-party-view";
import { CustomerLobbyView } from "@/components/lobby/customer-lobby-view";
import { HostLobbyView } from "@/components/lobby/host-lobby-view";
import type {
  ApplicationStatus,
  PartyFormState,
  PartyStatus,
} from "@/components/lobby/types";
import {
  type UnvotedParty,
  UnvotedRatingsDialog,
} from "@/components/lobby/unvoted-ratings-dialog";
import { statusBadgeClass } from "@/components/lobby/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, api, assetUrl } from "@/lib/eden";

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

const lobbyStateQuery = (playerId: number) =>
  queryOptions({
    queryKey: ["lobby", "state"],
    queryFn: async () => {
      const { data, error } = await api.lobby.state.get({
        $query: { playerId },
      });
      if (error) throw error;
      return data;
    },
  });

const templatesQuery = (playerId: number) =>
  queryOptions({
    queryKey: ["lobby", "templates", playerId],
    queryFn: async () => {
      const { data, error } = await api.lobby.templates.get({
        $query: { playerId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });

const unvotedPartiesQuery = (playerId: number) =>
  queryOptions({
    queryKey: ["ratings", "unvoted", playerId],
    queryFn: async () => {
      const { data, error } = await api.ratings.unvoted[playerId].get();
      if (error) throw error;
      return data as UnvotedParty[];
    },
    enabled: !!playerId,
  });

function applicantsQuery(partyId: number, hostId: number) {
  return queryOptions({
    queryKey: ["lobby", "applicants", partyId],
    queryFn: async () => {
      const { data, error } = await api.parties[partyId].applications.get({
        $query: { hostId },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function LobbyPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
  const { data: lobbyState } = useQuery({
    ...lobbyStateQuery(user?.id || 0),
    enabled: !!user?.id,
  });

  // Fetch templates
  const { data: serverTemplates } = useQuery(templatesQuery(user?.id || 0));

  // Fetch unvoted parties
  const { data: unvotedParties } = useQuery(unvotedPartiesQuery(user?.id || 0));
  const [unvotedDialogOpen, setUnvotedDialogOpen] = useState(false);
  const [ratedParties, setRatedParties] = useState<Set<number>>(new Set());

  // Show unvoted parties dialog on load if there are any
  useEffect(() => {
    if (unvotedParties && unvotedParties.length > 0) {
      setUnvotedDialogOpen(true);
    }
  }, [unvotedParties]);

  // Fetch applicants when in host mode
  const partyId = lobbyState?.kind === "host" ? lobbyState.party.id : undefined;
  const { data: applicants } = useQuery({
    ...applicantsQuery(partyId || 0, user?.id || 0),
    enabled: partyId !== undefined && !!user?.id,
  });

  // Listen for live applicant updates via SSE when in host mode
  useEffect(() => {
    if (!partyId) return;

    const eventSource = new EventSource(
      `${API_BASE_URL}/parties/${partyId}/applications/live`,
    );

    eventSource.addEventListener("application.created", (_event) => {
      try {
        queryClient.invalidateQueries({
          queryKey: ["lobby", "applicants", partyId],
        });
      } catch (error) {
        console.error("Failed to handle application.created event", error);
      }
    });

    eventSource.addEventListener("application.updated", (_event) => {
      try {
        queryClient.invalidateQueries({
          queryKey: ["lobby", "applicants", partyId],
        });
      } catch (error) {
        console.error("Failed to handle application.updated event", error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [partyId, queryClient]);

  // Listen for application status updates when in customer mode
  const customerPartyId =
    lobbyState?.kind === "customer"
      ? lobbyState.application.partyId
      : undefined;
  useEffect(() => {
    if (!customerPartyId) return;

    const eventSource = new EventSource(
      `${API_BASE_URL}/parties/${customerPartyId}/applications/live`,
    );

    eventSource.addEventListener("application.updated", (_event) => {
      try {
        queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      } catch (error) {
        console.error("Failed to handle application.updated event", error);
      }
    });

    eventSource.addEventListener("party.status.updated", (_event) => {
      try {
        queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      } catch (error) {
        console.error("Failed to handle party.status.updated event", error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [customerPartyId, queryClient]);

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
      : lobbyState?.kind === "customer"
        ? (lobbyState.application.party.status as PartyStatus)
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
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.parties.post({
        ...payload,
        hostId: user.id,
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
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.parties[partyId].status.put({
        status,
        hostId: user.id,
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
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.parties[partyId].delete({
        $query: { hostId: user.id },
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
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.applications[partyId][
        playerId
      ].status.put({
        status,
        hostId: user.id,
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
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.applications[partyId][playerId].delete({
        $query: { requesterPlayerId: user.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
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
    onSuccess: (_, variables) => {
      setRatedParties((prev) => new Set(prev).add(variables.partyId));
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
      queryClient.invalidateQueries({ queryKey: ["ratings", "unvoted"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateIndex: number) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await api.lobby.templates[templateIndex].delete({
        $query: { playerId: user.id },
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
    if (!user?.id) return;
    const { error } = await api.lobby.templates.post({
      $query: { playerId: user.id },
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
    <div className="flex w-full flex-col gap-6 p-6 mx-auto max-w-4xl">
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
          partyId={partyId || 0}
          partyTitle={
            lobbyState?.kind === "customer"
              ? lobbyState.application.party.title
              : ""
          }
          partyDescription={
            lobbyState?.kind === "customer"
              ? (lobbyState.application.party.description ?? undefined)
              : undefined
          }
          categoryDisplayName={
            lobbyState?.kind === "customer"
              ? lobbyState.application.party.category.displayName
              : ""
          }
          leagueName={
            lobbyState?.kind === "customer"
              ? lobbyState.application.party.league.name
              : ""
          }
          hostId={
            lobbyState?.kind === "customer"
              ? (lobbyState.application.party.host?.id ?? 0)
              : 0
          }
          hostIgn={
            lobbyState?.kind === "customer"
              ? (lobbyState.application.party.host?.ign ?? "")
              : ""
          }
          hostRating={
            lobbyState?.kind === "customer"
              ? (lobbyState.application.party.host?.hostRating ?? 0)
              : 0
          }
          cost={
            lobbyState?.kind === "customer"
              ? lobbyState.application.party.cost
              : 0
          }
          currencyName={
            lobbyState?.kind === "customer"
              ? lobbyState.application.party.currency.name
              : ""
          }
          currencyIcon={
            lobbyState?.kind === "customer"
              ? assetUrl(lobbyState.application.party.currency.icon)
              : undefined
          }
          applicationStatus={applicationStatus}
          partyStatus={partyStatus}
          hasRated={ratedParties.has(partyId || 0)}
          onCancelApplication={(partyId, playerId) =>
            cancelApplicationMutation.mutate({ partyId, playerId })
          }
          onSubmitRating={(giverId, receiverId, partyId, value) =>
            submitRatingMutation.mutate({ giverId, receiverId, partyId, value })
          }
        />
      )}
      {activeView === "host" && (
        <HostLobbyView
          capacity={form.capacity}
          partyId={partyId || 0}
          partyTitle={lobbyState?.kind === "host" ? lobbyState.party.title : ""}
          partyDescription={
            lobbyState?.kind === "host"
              ? (lobbyState.party.description ?? undefined)
              : undefined
          }
          partyStatus={partyStatus}
          applicants={normalizedApplicants}
          submittedRatings={
            ratedParties.has(partyId || 0)
              ? new Set(normalizedApplicants.map((a) => a.id))
              : new Set()
          }
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

      {/* Unvoted Parties Dialog */}
      <UnvotedRatingsDialog
        open={unvotedDialogOpen}
        onOpenChange={setUnvotedDialogOpen}
        unvotedParties={unvotedParties || []}
        userId={user?.id || 0}
        onSubmitRating={(giverId, receiverId, partyId, value) =>
          submitRatingMutation.mutate({ giverId, receiverId, partyId, value })
        }
      />
    </div>
  );
}

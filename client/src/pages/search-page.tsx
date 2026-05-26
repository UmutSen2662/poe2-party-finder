import {
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PartyCard } from "@/components/party-card";
import {
  type SearchFilterState,
  SearchFilters,
} from "@/components/search-filters";
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

interface PartiesSearchParams {
  leagueId?: number;
  categoryId?: number;
  currencyId?: number;
  minHostRating?: number;
  includeUnrated?: boolean;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}

function partiesQuery(params: PartiesSearchParams) {
  return queryOptions({
    queryKey: ["parties", params],
    queryFn: async () => {
      const { data, error } = await api.parties.get({ $query: params });
      if (error) throw error;
      return data;
    },
  });
}

type PartyListItem = NonNullable<
  Awaited<ReturnType<typeof api.parties.get>>["data"]
>[number];

function buildLiveSearchUrl(params: PartiesSearchParams): string {
  const url = new URL(`${API_BASE_URL}/parties/live`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function SearchPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: leagues } = useSuspenseQuery(leaguesQuery);
  const { data: currencies } = useSuspenseQuery(currenciesQuery);

  const filterCategories = categories.map((category) => ({
    id: category.id,
    displayName: category.name,
  }));

  const filterLeagues = leagues.map((league) => ({
    id: league.id,
    displayName: league.name,
  }));

  const filterCurrencies = currencies.map((currency) => ({
    id: currency.id,
    name: currency.name,
    icon: assetUrl(currency.icon),
  }));

  const [filterState, setFilterState] = useState<SearchFilterState>(() => ({
    searchQuery: "",
    hostRating: 0,
    includeUnrated: true,
    liveSearchEnabled: false,
    categoryId: "all",
    leagueId: leagues[0]?.id ?? null,
    minPrice: "",
    maxPrice: "",
    currencyId: null,
  }));

  // Params that have actually been submitted via the Search button.
  const [submittedParams, setSubmittedParams] =
    useState<PartiesSearchParams | null>(null);

  // Per-party "last refreshed at" timestamps. Drives the staleness indicator
  // on each PartyCard independently — refreshing one card does not reset the
  // others.
  const [refreshedAt, setRefreshedAt] = useState<Record<number, number>>({});

  const handleSearchChange = (updates: Partial<SearchFilterState>) => {
    setFilterState((prev) => {
      const next = { ...prev, ...updates };
      // Turning Live Search on should first commit the current filters as a
      // regular search; the SSE stream then layers new parties on top.
      if (updates.liveSearchEnabled === true && !prev.liveSearchEnabled) {
        setSubmittedParams(buildParams(next));
      }
      return next;
    });
  };

  const buildParams = (state: SearchFilterState): PartiesSearchParams => {
    const params: PartiesSearchParams = {};
    if (state.leagueId !== null) params.leagueId = state.leagueId;
    if (state.categoryId !== "all") params.categoryId = state.categoryId;
    if (state.currencyId !== null) params.currencyId = state.currencyId;
    if (state.hostRating > 0) {
      params.minHostRating = state.hostRating;
      params.includeUnrated = state.includeUnrated;
    }
    const minPrice = state.minPrice ? Number(state.minPrice) : Number.NaN;
    const maxPrice = state.maxPrice ? Number(state.maxPrice) : Number.NaN;
    if (!Number.isNaN(minPrice)) params.minPrice = minPrice;
    if (!Number.isNaN(maxPrice)) params.maxPrice = maxPrice;
    const q = state.searchQuery.trim();
    if (q !== "") params.q = q;
    return params;
  };

  const handleSearch = () => {
    // A full search resets per-card freshness — every card displays data
    // that was just fetched.
    setRefreshedAt({});
    setSubmittedParams(buildParams(filterState));
  };

  const handleRefreshParty = async (partyId: number) => {
    if (!submittedParams) return;
    const queryKey = partiesQuery(submittedParams).queryKey;
    try {
      const { data, error } = await api.parties[partyId].get();
      if (error) throw error;
      queryClient.setQueryData<PartyListItem[]>(queryKey, (current) => {
        if (!current) return current;
        return current.map((party) =>
          party.id === data.id ? (data as PartyListItem) : party,
        );
      });
      setRefreshedAt((prev) => ({ ...prev, [partyId]: Date.now() }));
    } catch (error) {
      // Party was likely deleted or no longer matches — drop it from the list.
      console.warn("Refresh failed; removing party from list", error);
      queryClient.setQueryData<PartyListItem[]>(queryKey, (current) => {
        if (!current) return current;
        return current.filter((party) => party.id !== partyId);
      });
      setRefreshedAt((prev) => {
        if (prev[partyId] === undefined) return prev;
        const { [partyId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const { data: parties, isFetching } = useQuery({
    ...partiesQuery(submittedParams ?? {}),
    enabled: submittedParams !== null,
  });

  // Reconcile per-party refresh timestamps with the current list:
  // - new ids (from a fresh search or an SSE event) get the current time
  // - existing ids preserve their timestamp (so refreshing one card doesn't
  //   reset the others)
  // - removed ids are dropped
  useEffect(() => {
    if (!parties) return;
    setRefreshedAt((prev) => {
      const now = Date.now();
      const next: Record<number, number> = {};
      let changed = false;
      for (const party of parties) {
        if (prev[party.id] !== undefined) {
          next[party.id] = prev[party.id];
        } else {
          next[party.id] = now;
          changed = true;
        }
      }
      if (!changed && Object.keys(prev).length === Object.keys(next).length) {
        return prev;
      }
      return next;
    });
  }, [parties]);

  // Open an SSE stream while Live Search is enabled and we have an active
  // search. New parties are prepended into the React Query cache for the
  // current submittedParams key so the list updates in real time.
  useEffect(() => {
    if (!filterState.liveSearchEnabled || !submittedParams) return;

    const queryKey = partiesQuery(submittedParams).queryKey;
    const eventSource = new EventSource(buildLiveSearchUrl(submittedParams));

    eventSource.addEventListener("party.created", (event) => {
      try {
        const party = JSON.parse(event.data) as PartyListItem;
        queryClient.setQueryData<PartyListItem[]>(queryKey, (current) => {
          if (!current) return [party];
          if (current.some((existing) => existing.id === party.id)) {
            return current;
          }
          return [party, ...current];
        });
      } catch (error) {
        console.error("Failed to parse live party event", error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [filterState.liveSearchEnabled, submittedParams, queryClient]);

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Party Services</h1>
      </header>
      <SearchFilters
        state={filterState}
        onChange={handleSearchChange}
        onSearch={handleSearch}
        categories={filterCategories}
        leagues={filterLeagues}
        currencies={filterCurrencies}
      />
      <div className="flex flex-col gap-4">
        {submittedParams === null ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Set your filters and hit Search to find parties.
          </p>
        ) : isFetching && !parties ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Searching…
          </p>
        ) : !parties || parties.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No parties match your filters.
          </p>
        ) : (
          parties.map((party) => (
            <PartyCard
              key={party.id}
              ign={party.host.ign}
              rating={party.host.hostRating}
              category={party.category.name}
              categoryImage={assetUrl(party.category.image)}
              description={party.description ?? ""}
              fee={party.cost}
              currency={{
                name: party.currency.name,
                icon: assetUrl(party.currency.icon),
              }}
              currentQueue={party.acceptedCount}
              maxQueue={party.capacity}
              createdAt={party.createdAt}
              lastRefreshedAt={refreshedAt[party.id]}
              isDisabled={false}
              onRefresh={() => handleRefreshParty(party.id)}
              onApply={() => console.log("Apply clicked", party.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

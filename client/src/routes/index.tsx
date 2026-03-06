import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  type SearchFilterState,
  SearchFilters,
} from "@/components/search-filters";
import { api } from "@/lib/eden";

type ItemsSearch = {
  searchQuery?: string;
  hostRating?: number;
  includeUnrated?: boolean;
  liveSearchEnabled?: boolean;
  category?: string;
  league?: string;
  minPrice?: string;
  maxPrice?: string;
  currency?: "divine" | "chaos";
};

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await api.categories.get();
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  component: Index,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(categoriesQuery),
  pendingComponent: () => (
    <div className="flex items-center justify-center p-12 text-muted-foreground w-full h-full">
      Loading services...
    </div>
  ),
  validateSearch: (search: Record<string, unknown>): ItemsSearch => {
    return {
      searchQuery: (search.searchQuery as string) || "",
      hostRating:
        search.hostRating !== undefined ? Number(search.hostRating) : 4,
      includeUnrated:
        search.includeUnrated !== undefined
          ? (search.includeUnrated as boolean)
          : true,
      liveSearchEnabled:
        search.liveSearchEnabled !== undefined
          ? (search.liveSearchEnabled as boolean)
          : false,
      category: (search.category as string) || "all",
      league: (search.league as string) || "Fate of the Vaal",
      minPrice: (search.minPrice as string) || "",
      maxPrice: (search.maxPrice as string) || "",
      currency: (search.currency as "divine" | "chaos") || "divine",
    };
  },
});

function Index() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: categories } = useSuspenseQuery(categoriesQuery);

  const handleSearchChange = (updates: Partial<SearchFilterState>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const filterState: SearchFilterState = {
    searchQuery: searchParams.searchQuery || "",
    hostRating: searchParams.hostRating ?? 4,
    includeUnrated: searchParams.includeUnrated ?? true,
    liveSearchEnabled: searchParams.liveSearchEnabled ?? false,
    category: searchParams.category || "all",
    league: searchParams.league || "Fate of the Vaal",
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    currency: (searchParams.currency as "divine" | "chaos") || "divine",
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <SearchFilters
        state={filterState}
        onChange={handleSearchChange}
        categories={categories}
      />
    </div>
  );
}

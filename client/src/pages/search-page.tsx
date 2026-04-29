import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  type SearchFilterState,
  SearchFilters,
} from "@/components/search-filters";
import { api } from "@/lib/eden";

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await api.categories.get();
    if (error) throw error;
    return data;
  },
});

export function SearchPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const filterCategories = categories.map((category) => ({
    id: category.id,
    displayName: category.name,
  }));

  const [filterState, setFilterState] = useState<SearchFilterState>({
    searchQuery: "",
    hostRating: 4,
    includeUnrated: true,
    liveSearchEnabled: false,
    category: "all",
    league: "Fate of the Vaal",
    minPrice: "",
    maxPrice: "",
    currency: "divine",
  });

  const handleSearchChange = (updates: Partial<SearchFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Party Services</h1>
      </header>
      <SearchFilters
        state={filterState}
        onChange={handleSearchChange}
        categories={filterCategories}
      />
    </div>
  );
}

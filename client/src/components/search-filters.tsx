import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioPillGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CurrencyBadge, type ServerCurrency } from "./currency-badge";

export interface SearchFilterState {
  searchQuery: string;
  hostRating: number;
  includeUnrated: boolean;
  liveSearchEnabled: boolean;
  categoryId: number | "all";
  leagueId: number | null;
  minPrice: string;
  maxPrice: string;
  currencyId: number | null;
}

export interface SearchFilterOption {
  id: number;
  displayName: string;
}

export interface SearchFiltersProps {
  state: SearchFilterState;
  onChange: (updates: Partial<SearchFilterState>) => void;
  onSearch: () => void;
  categories: SearchFilterOption[];
  leagues: SearchFilterOption[];
  currencies: (ServerCurrency & { id: number })[];
}

export function SearchFilters({
  state,
  onChange,
  onSearch,
  categories,
  leagues,
  currencies,
}: SearchFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Helper variable to avoid repeating state.liveSearchEnabled
  const disabled = state.liveSearchEnabled;

  return (
    <Collapsible
      open={isFiltersOpen}
      onOpenChange={setIsFiltersOpen}
      className="flex flex-col gap-6 w-full"
    >
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-4">
        {/* Top Search Row */}
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={state.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              placeholder="Search for services..."
              className="pl-9 pr-9 bg-card"
              disabled={disabled}
            />
            {state.searchQuery && !disabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange({ searchQuery: "" })}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Select
            value={state.leagueId !== null ? state.leagueId.toString() : ""}
            onValueChange={(val) =>
              onChange({ leagueId: val ? Number(val) : null })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px] bg-card">
              {(() => {
                const selected = leagues.find((l) => l.id === state.leagueId);
                return selected ? (
                  <span data-slot="select-value">{selected.displayName}</span>
                ) : (
                  <SelectValue placeholder="Select League" />
                );
              })()}
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id.toString()}>
                    {league.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left Side: Live Search Switch */}
          <div className="flex-1 flex justify-start items-center gap-2 pl-1">
            <Switch
              id="live-search"
              checked={state.liveSearchEnabled}
              onCheckedChange={(checked) =>
                onChange({ liveSearchEnabled: checked as boolean })
              }
            />
            <Label htmlFor="live-search">Live Search</Label>
          </div>

          {/* Center: Search Button */}
          <div className="flex flex-1 justify-center">
            <Button
              className="px-8 max-w-sm"
              disabled={disabled}
              onClick={onSearch}
            >
              Search
            </Button>
          </div>

          {/* Right Side: Filter Button */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <CollapsibleTrigger
              render={
                <Button variant="outline" className="gap-2 justify-between" />
              }
            >
              <div className="flex items-center gap-2">
                {isFiltersOpen ? "Hide Filters" : "Show Filters"}
              </div>
              {isFiltersOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      {/* Expandable Filter Section */}
      <CollapsibleContent>
        <Card
          className={`border-border transition-opacity ${
            disabled ? "opacity-50 pointer-events-none" : "bg-card/50"
          }`}
        >
          <CardContent className="flex flex-col gap-6">
            {/* Filter Row 1: Category */}
            <div className="flex flex-col gap-4">
              <div className="text-muted-foreground font-medium text-xs tracking-wider">
                Service Category
              </div>
              <RadioGroup
                value={
                  state.categoryId === "all"
                    ? "all"
                    : state.categoryId.toString()
                }
                onValueChange={(val) =>
                  onChange({
                    categoryId: val === "all" ? "all" : Number(val),
                  })
                }
                className="flex flex-wrap justify-start gap-2"
                disabled={disabled}
              >
                <RadioPillGroupItem value="all">All</RadioPillGroupItem>
                {categories.map((cat) => (
                  <RadioPillGroupItem key={cat.id} value={cat.id.toString()}>
                    {cat.displayName}
                  </RadioPillGroupItem>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
              {/* Filter Row 2: Host Requirements */}
              <div className="flex flex-col gap-4">
                <div className="text-muted-foreground font-medium text-xs tracking-wider">
                  Host Requirements
                </div>

                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel htmlFor="host-rating">
                      Minimum Host Rating
                    </FieldLabel>
                    <span className="text-primary font-bold text-base">
                      {state.hostRating}
                    </span>
                  </div>
                  <Slider
                    id="host-rating"
                    max={10}
                    step={1}
                    value={[state.hostRating]}
                    showNotches
                    onValueChange={(val) =>
                      onChange({
                        hostRating: Array.isArray(val) ? val[0] : val,
                      })
                    }
                    className="py-2"
                    disabled={disabled}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>0 (New)</span>
                    <span>10 (Trusted)</span>
                  </div>
                </Field>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-unrated"
                    checked={state.includeUnrated}
                    onCheckedChange={(checked) =>
                      onChange({ includeUnrated: checked as boolean })
                    }
                    disabled={disabled}
                  />
                  <Label htmlFor="include-unrated">Include New Hosts</Label>
                </div>
              </div>

              <Separator orientation="vertical" />

              {/* Filter Row 2: Pricing */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground font-medium text-xs tracking-wider">
                    Pricing
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      onChange({ minPrice: "", maxPrice: "" });
                    }}
                    className="text-xs px-1 h-auto"
                    disabled={disabled}
                  >
                    Clear
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="Min"
                    value={state.minPrice}
                    onChange={(e) => onChange({ minPrice: e.target.value })}
                    className="bg-background no-spinner"
                    autoComplete="off"
                    disabled={disabled}
                  />
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="Max"
                    value={state.maxPrice}
                    onChange={(e) => onChange({ maxPrice: e.target.value })}
                    className="bg-background no-spinner"
                    autoComplete="off"
                    disabled={disabled}
                  />
                </div>

                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1">
                    Currency
                  </FieldLabel>
                  <Select
                    value={
                      state.currencyId !== null
                        ? state.currencyId.toString()
                        : "all"
                    }
                    onValueChange={(val) =>
                      onChange({
                        currencyId: val === "all" ? null : Number(val),
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full bg-background">
                      {(() => {
                        const selected = currencies.find(
                          (c) => c.id === state.currencyId,
                        );
                        return selected ? (
                          <span data-slot="select-value">
                            <CurrencyBadge currency={selected} />
                          </span>
                        ) : (
                          <span data-slot="select-value">Any currency</span>
                        );
                      })()}
                    </SelectTrigger>
                    <SelectPositioner>
                      <SelectContent>
                        <SelectItem value="all">Any currency</SelectItem>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.id}
                            value={currency.id.toString()}
                          >
                            <CurrencyBadge currency={currency} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

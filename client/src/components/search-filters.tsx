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
import { CurrencyBadge } from "./currency-badge";

export interface SearchFilterState {
  searchQuery: string;
  hostRating: number;
  includeUnrated: boolean;
  liveSearchEnabled: boolean;
  category: string;
  league: string;
  minPrice: string;
  maxPrice: string;
  currency: "divine" | "chaos";
}

export interface SearchFiltersProps {
  state: SearchFilterState;
  onChange: (updates: Partial<SearchFilterState>) => void;
  isLoadingCategories: boolean;
  categories: { id: string | number; displayName: string }[] | undefined;
}

export function SearchFilters({
  state,
  onChange,
  isLoadingCategories,
  categories,
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
            value={state.league}
            onValueChange={(val) => onChange({ league: val || "" })}
            disabled={disabled}
          >
            <SelectTrigger className="w-[200px] bg-card">
              <SelectValue placeholder="Select League" />
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                <SelectItem value="Fate of the Vaal">
                  Fate of the Vaal
                </SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
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
            <Button className="px-8 max-w-sm" disabled={disabled}>
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
          className={`mt-2 border-border/50 transition-opacity ${
            disabled ? "opacity-50 pointer-events-none" : "bg-card/50"
          }`}
        >
          <CardContent className="flex flex-col gap-8">
            {/* Filter Row 1: Category */}
            <div className="flex flex-col gap-4">
              <div className="text-muted-foreground font-medium text-xs tracking-wider">
                Service Category
              </div>
              <RadioGroup
                value={state.category}
                onValueChange={(val) => onChange({ category: val })}
                className="flex flex-wrap justify-start gap-2"
                disabled={disabled}
              >
                <RadioPillGroupItem value="all">All</RadioPillGroupItem>
                {isLoadingCategories ? (
                  <div className="text-sm text-muted-foreground py-1 px-3">
                    Loading categories...
                  </div>
                ) : (
                  categories?.map((cat) => (
                    <RadioPillGroupItem key={cat.id} value={cat.id.toString()}>
                      {cat.displayName}
                    </RadioPillGroupItem>
                  ))
                )}
              </RadioGroup>
            </div>

            <Separator />

            <div className="grid grid-cols-[1fr_auto_1fr] gap-8">
              {/* Filter Row 2: Provider Requirements */}
              <div className="flex flex-col gap-6">
                <div className="text-muted-foreground font-medium text-xs tracking-wider">
                  Provider Requirements
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
                    defaultValue={[2.5]}
                    max={5}
                    step={0.5}
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
                    <span>5 (Trusted)</span>
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
                  <Label htmlFor="include-unrated">
                    Include Unrated/New Hosts
                  </Label>
                </div>
              </div>

              <Separator orientation="vertical" />

              {/* Filter Row 2: Pricing */}
              <div className="flex flex-col gap-6">
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
                    className="text-xs p-1 h-auto"
                    disabled={disabled}
                  >
                    Clear
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="min-price"
                      className="text-xs text-muted-foreground mb-1"
                    >
                      Min Price
                    </FieldLabel>
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
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="max-price"
                      className="text-xs text-muted-foreground mb-1"
                    >
                      Max Price
                    </FieldLabel>
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
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1">
                    Currency
                  </FieldLabel>
                  <Select
                    value={state.currency}
                    onValueChange={(val) =>
                      onChange({ currency: val as "divine" | "chaos" })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full bg-background">
                      {state.currency ? (
                        <span data-slot="select-value">
                          <CurrencyBadge currency={state.currency} />
                        </span>
                      ) : (
                        <SelectValue placeholder="Select Currency" />
                      )}
                    </SelectTrigger>
                    <SelectPositioner>
                      <SelectContent>
                        <SelectItem value="divine">
                          <CurrencyBadge currency="divine" />
                        </SelectItem>
                        <SelectItem value="chaos">
                          <CurrencyBadge currency="chaos" />
                        </SelectItem>
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

import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Search, Shield, X } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [hostRating, setHostRating] = useState([2.5]);
  const [includeUnrated, setIncludeUnrated] = useState(true);
  const [liveSearchEnabled, setLiveSearchEnabled] = useState(false);
  const [category, setCategory] = useState(["all"]);
  const [league, setLeague] = useState("Fate of the Vaal");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currency, setCurrency] = useState("Divine Orb");

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground p-6 gap-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Path of Exile 2 Services
          </h1>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          6,421 Services Active
        </div>
      </div>

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="pl-9 pr-9 bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select
              value={league}
              onValueChange={(val) => setLeague(val || "")}
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
            <div className="flex-1 flex justify-start items-center space-x-2">
              <Switch
                id="live-search"
                checked={liveSearchEnabled}
                onCheckedChange={setLiveSearchEnabled}
              />
              <label
                htmlFor="live-search"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
              >
                Live Search
              </label>
            </div>

            {/* Center: Search Button */}
            <div className="flex flex-1 justify-center">
              <Button className="px-12 max-w-sm bg-primary/90 hover:bg-primary text-primary-foreground">
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
                  <Search className="w-4 h-4" />
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
          <div className="pt-2">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col gap-8">
                {/* Filter Row 1: Category */}
                <div className="flex flex-col gap-4">
                  <div className="text-muted-foreground font-medium text-xs tracking-wider">
                    Service Category
                  </div>
                  <ToggleGroup
                    value={category}
                    onValueChange={setCategory}
                    className="flex flex-wrap justify-start gap-2"
                  >
                    <ToggleGroupItem
                      value="all"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-full px-6"
                    >
                      All
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="boss"
                      className="rounded-full px-6 border border-border/50"
                    >
                      Boss Carries
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="campaign"
                      className="rounded-full px-6 border border-border/50"
                    >
                      Campaign Progression
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="lab"
                      className="rounded-full px-6 border border-border/50"
                    >
                      Labyrinth Runs
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="crafting"
                      className="rounded-full px-6 border border-border/50"
                    >
                      Crafting Services
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12">
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
                          {hostRating[0]}
                        </span>
                      </div>
                      <Slider
                        id="host-rating"
                        defaultValue={[2.5]}
                        max={5}
                        step={0.5}
                        value={hostRating}
                        onValueChange={(val) =>
                          setHostRating(Array.isArray(val) ? [...val] : [val])
                        }
                        className="py-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>0 (New)</span>
                        <span>5 (Trusted)</span>
                      </div>
                    </Field>

                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="include-unrated"
                        checked={includeUnrated}
                        onCheckedChange={(checked) =>
                          setIncludeUnrated(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="include-unrated"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Unrated/New Hosts
                      </label>
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
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                        className="text-xs cursor-pointer p-1 h-auto"
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
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          autoComplete="off"
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
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          autoComplete="off"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground mb-1">
                        Currency
                      </FieldLabel>
                      <Select
                        value={currency}
                        onValueChange={(val) => setCurrency(val || "")}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectPositioner>
                          <SelectContent>
                            <SelectItem value="Divine Orb">
                              <span className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                                  D
                                </div>
                                Divine Orb
                              </span>
                            </SelectItem>
                            <SelectItem value="Chaos Orb">
                              <span className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                                  C
                                </div>
                                Chaos Orb
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </SelectPositioner>
                      </Select>
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

import { FileText, Plus, Save } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CurrencyBadge } from "@/components/currency-badge";
import { PartyCard } from "@/components/party-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { activeCategories, activeLeagues, currencies } from "./mock-data";
import type { CurrencyId, PartyFormState, Template } from "./types";
import { statusBadgeClass } from "./utils";

interface CreatePartyViewProps {
  form: PartyFormState;
  setForm: Dispatch<SetStateAction<PartyFormState>>;
  templates: Template[];
  onSaveTemplate: () => void;
}

export function CreatePartyView({
  form,
  setForm,
  templates,
  onSaveTemplate,
}: CreatePartyViewProps) {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const selectedCategory = activeCategories.find(
    (category) => category.id === form.categoryId,
  );

  const updateForm = (updates: Partial<PartyFormState>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const applyTemplate = (template: Template) => {
    setForm(template.data);
    setTemplatesOpen(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_520px]">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl">Create Party</CardTitle>
              <CardDescription>
                Fill the database-backed party fields. Hidden values like host,
                status, and created timestamp are handled automatically later.
              </CardDescription>
            </div>
            <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
              <DialogTrigger
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileText className="size-4" />
                Templates
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Party Templates</DialogTitle>
                  <DialogDescription>
                    Apply a saved JSON template or save the current form as a
                    new template.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full rounded-lg border bg-background/40 p-3 text-left transition-colors hover:bg-accent/50"
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{template.data.cost}</span>
                        <CurrencyBadge
                          currency={template.data.currencyId}
                          showLabel={false}
                          size={14}
                        />
                        <span>{template.data.capacity} spots</span>
                      </div>
                    </button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={onSaveTemplate}>
                    <Save className="size-4" />
                    Save Current Form
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel>League</FieldLabel>
                <Select
                  value={form.leagueId}
                  onValueChange={(value) =>
                    updateForm({ leagueId: value || "" })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {activeLeagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPositioner>
                </Select>
                <FieldDescription>
                  Only active leagues are shown.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) =>
                    updateForm({ categoryId: value || "" })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {activeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPositioner>
                </Select>
                <FieldDescription>
                  Only active categories are shown.
                </FieldDescription>
              </Field>
            </div>

            <Field>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>Title</FieldLabel>
                <span className="text-xs text-muted-foreground">
                  {form.title.length}/255
                </span>
              </div>
              <Input
                value={form.title}
                onChange={(event) => updateForm({ title: event.target.value })}
                maxLength={255}
                placeholder="Short service title"
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  updateForm({ description: event.target.value })
                }
                placeholder="Long TFT-style rules and service details"
                className="min-h-40 resize-y"
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-[1fr_1fr_1fr]">
              <Field>
                <FieldLabel>Capacity</FieldLabel>
                <Select
                  value={form.capacity}
                  onValueChange={(value) =>
                    updateForm({ capacity: value || "1" })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((capacity) => (
                        <SelectItem key={capacity} value={String(capacity)}>
                          {capacity} {capacity === 1 ? "spot" : "spots"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPositioner>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Cost</FieldLabel>
                <Input
                  value={form.cost}
                  onChange={(event) => updateForm({ cost: event.target.value })}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Exact fee"
                />
              </Field>

              <Field>
                <FieldLabel>Currency</FieldLabel>
                <Select
                  value={form.currencyId}
                  onValueChange={(value) =>
                    updateForm({
                      currencyId: (value || "divine") as CurrencyId,
                    })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          <CurrencyBadge currency={currency.id} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPositioner>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <div className="text-sm text-muted-foreground">
            Will create as{" "}
            <Badge className={statusBadgeClass("Gathering")}>Gathering</Badge>
          </div>
          <Button>
            <Plus className="size-4" />
            Create Lobby
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Party Card Preview</h2>
          <p className="text-sm text-muted-foreground">
            This is how the listing will appear in live search.
          </p>
        </div>
        <PartyCard
          ign="HostCarry"
          rating={9.5}
          category={selectedCategory?.name ?? "Unknown Category"}
          categoryColor={
            selectedCategory?.color ?? "bg-secondary text-secondary-foreground"
          }
          description={form.description || "No description yet."}
          fee={Number(form.cost) || 0}
          currency={form.currencyId}
          currentQueue={0}
          maxQueue={Number(form.capacity) || 1}
          isFresh={false}
          isStale={false}
          onApply={() => undefined}
        />
      </div>
    </div>
  );
}

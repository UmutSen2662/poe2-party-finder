import { FileText, Plus, Save, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CurrencyBadge } from "@/components/currency-badge";
import { PartyCard } from "@/components/party-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { assetUrl } from "@/lib/eden";
import type { PartyFormState, Template } from "./types";
import { statusBadgeClass } from "./utils";

interface CreatePartyViewProps {
  form: PartyFormState;
  setForm: Dispatch<SetStateAction<PartyFormState>>;
  templates: Template[];
  categories: Array<{ id: number; name: string; imagePath: string | null }>;
  leagues: Array<{ id: number; name: string }>;
  currencies: Array<{ id: number; name: string; icon: string | null }>;
  onSaveTemplate: () => void;
  onDeleteTemplate: (index: number) => void;
  onCreateParty: (payload: {
    title: string;
    description?: string;
    capacity: number;
    cost: number;
    leagueId: number;
    categoryId: number;
    currencyId: number;
  }) => void;
  userBadges?: Array<{
    id: number;
    name: string;
    icon: string | null;
    rarity: "common" | "uncommon" | "rare" | "legendary";
  }>;
}

export function CreatePartyView({
  form,
  setForm,
  templates,
  userBadges = [],
  categories,
  leagues,
  currencies,
  onSaveTemplate,
  onDeleteTemplate,
  onCreateParty,
}: CreatePartyViewProps) {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const selectedCategory = categories.find(
    (category) => category.id === form.categoryId,
  );

  const updateForm = (updates: Partial<PartyFormState>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const applyTemplate = (template: Template) => {
    setForm(template.data);
    setTemplatesOpen(false);
  };

  const handleDeleteTemplate = (index: number) => {
    setTemplateToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete !== null) {
      onDeleteTemplate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleCreateParty = () => {
    if (!form.title || !form.leagueId || !form.categoryId || !form.currencyId) {
      return;
    }
    onCreateParty({
      title: form.title,
      description: form.description || undefined,
      capacity: Number(form.capacity),
      cost: Number(form.cost),
      leagueId: form.leagueId,
      categoryId: form.categoryId,
      currencyId: form.currencyId,
    });
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
                  {templates.map((template, index) => {
                    const leagueName =
                      leagues.find((l) => l.id === template.data.leagueId)
                        ?.name || "Unknown";
                    const categoryName =
                      categories.find((c) => c.id === template.data.categoryId)
                        ?.name || "Unknown";
                    const currencyName =
                      currencies.find((c) => c.id === template.data.currencyId)
                        ?.name || "Unknown";

                    return (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 rounded-lg border bg-background/40 p-3 transition-colors hover:bg-accent/50"
                      >
                        <button
                          type="button"
                          onClick={() => applyTemplate(template)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{template.data.cost}</span>
                            <CurrencyBadge
                              currency={{ name: currencyName, icon: null }}
                              showLabel={false}
                              size={14}
                            />
                            <span>{template.data.capacity} spots</span>
                            <span>• {leagueName}</span>
                            <span>• {categoryName}</span>
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTemplate(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={onSaveTemplate}>
                    <Save className="size-4" />
                    Save Current Form
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this template? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteTemplate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel>League</FieldLabel>
                <Select
                  value={form.leagueId?.toString() || ""}
                  onValueChange={(value) =>
                    updateForm({ leagueId: value ? Number(value) : null })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue
                      placeholder="Select league"
                      renderValue={(val) => {
                        const selected = leagues.find(
                          (l) => l.id === Number(val),
                        );
                        return selected?.name;
                      }}
                    />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={String(league.id)}>
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
                  value={form.categoryId?.toString() || ""}
                  onValueChange={(value) =>
                    updateForm({ categoryId: value ? Number(value) : null })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue
                      placeholder="Select category"
                      renderValue={(val) => {
                        const selected = categories.find(
                          (c) => c.id === Number(val),
                        );
                        return selected?.name;
                      }}
                    />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
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
                    <SelectValue
                      placeholder="Select capacity"
                      renderValue={(val) => {
                        const num = Number(val);
                        return `${num} ${num === 1 ? "spot" : "spots"}`;
                      }}
                    />
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
                  value={String(form.currencyId)}
                  onValueChange={(value) =>
                    updateForm({ currencyId: Number(value) })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue
                      placeholder="Select currency"
                      renderValue={(val) => {
                        const selected = currencies.find(
                          (c) => c.id === Number(val),
                        );
                        return selected ? (
                          <CurrencyBadge
                            currency={{
                              name: selected.name,
                              icon: selected.icon,
                            }}
                          />
                        ) : null;
                      }}
                    />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem
                          key={currency.id}
                          value={String(currency.id)}
                        >
                          <CurrencyBadge
                            currency={{
                              name: currency.name,
                              icon: currency.icon,
                            }}
                          />
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
          <Button onClick={handleCreateParty}>
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
          title={form.title || "Untitled Party"}
          ign="HostCarry"
          rating={9.5}
          category={selectedCategory?.name ?? "Unknown Category"}
          categoryImage={
            selectedCategory?.imagePath
              ? assetUrl(selectedCategory.imagePath)
              : undefined
          }
          currency={{
            name:
              currencies.find((c) => c.id === form.currencyId)?.name ||
              "Unknown",
            icon: assetUrl(
              currencies.find((c) => c.id === form.currencyId)?.icon,
            ),
          }}
          description={form.description || "No description yet."}
          fee={Number(form.cost) || 0}
          currentQueue={0}
          maxQueue={Number(form.capacity) || 1}
          hostBadges={userBadges}
          onApply={() => undefined}
        />
      </div>
    </div>
  );
}

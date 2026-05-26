import { Clipboard, Crown, Plus } from "lucide-react";
import { useState } from "react";
import { CreatePartyView } from "@/components/lobby/create-party-view";
import { CustomerLobbyView } from "@/components/lobby/customer-lobby-view";
import { HostLobbyView } from "@/components/lobby/host-lobby-view";
import {
  initialApplicants,
  initialFormState,
  initialTemplates,
} from "@/components/lobby/mock-data";
import type {
  Applicant,
  ApplicationStatus,
  LobbyView,
  PartyFormState,
  PartyStatus,
  Template,
} from "@/components/lobby/types";
import { statusBadgeClass } from "@/components/lobby/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function ViewSwitcher({
  view,
  setView,
}: {
  view: LobbyView;
  setView: (view: LobbyView) => void;
}) {
  return (
    <Card className="p-1 flex-row gap-1 w-fit rounded-lg bg-muted/60">
      {[
        { id: "create" as const, label: "Create", icon: Plus },
        { id: "customer" as const, label: "Customer", icon: Clipboard },
        { id: "host" as const, label: "Host", icon: Crown },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <Button
            key={item.id}
            variant={view === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setView(item.id)}
          >
            <Icon className="size-4" />
            {item.label}
          </Button>
        );
      })}
    </Card>
  );
}

export function LobbyPage() {
  const [view, setView] = useState<LobbyView>("create");
  const [form, setForm] = useState<PartyFormState>(initialFormState);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [partyStatus, setPartyStatus] = useState<PartyStatus>("Gathering");
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>("Pending");
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);

  const activeViewLabel =
    view === "create"
      ? "Empty / Create Party View"
      : view === "customer"
        ? "Customer View"
        : "Host View";

  const saveTemplate = () => {
    setTemplates((current) => [
      ...current,
      {
        id: `template-${current.length + 1}`,
        name: form.title || `Template ${current.length + 1}`,
        data: form,
      },
    ]);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6 mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lobby</h1>
          <p className="mt-2 text-muted-foreground">
            Unified active-session hub for creating, joining, and managing
            parties.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dev state switcher
          </div>
          <ViewSwitcher view={view} setView={setView} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{activeViewLabel}</Badge>
        <Badge className={statusBadgeClass(partyStatus)}>
          Party: {partyStatus}
        </Badge>
      </div>

      {view === "create" && (
        <CreatePartyView
          form={form}
          setForm={setForm}
          templates={templates}
          onSaveTemplate={saveTemplate}
        />
      )}
      {view === "customer" && (
        <CustomerLobbyView
          form={form}
          applicationStatus={applicationStatus}
          setApplicationStatus={setApplicationStatus}
          partyStatus={partyStatus}
          applicants={applicants}
        />
      )}
      {view === "host" && (
        <HostLobbyView
          form={form}
          partyStatus={partyStatus}
          setPartyStatus={setPartyStatus}
          applicants={applicants}
          setApplicants={setApplicants}
        />
      )}
    </div>
  );
}

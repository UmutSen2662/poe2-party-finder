import type { SearchPartyRow } from "../routes/parties/parties.service";

export interface PartyLiveFilters {
  leagueId?: number;
  categoryId?: number;
  currencyId?: number;
  minHostRating?: number;
  includeUnrated?: boolean;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}

export type PartyLiveEvent =
  | {
      type: "party.created";
      data: SearchPartyRow;
    }
  | {
      type: "party.status.updated";
      data: { partyId: number; status: string };
    }
  | {
      type: "heartbeat";
      data: { timestamp: string };
    };

interface PartyLiveSubscriber {
  filters: PartyLiveFilters;
  queue: PartyLiveEvent[];
  closed: boolean;
  notify?: () => void;
}

const subscribers = new Set<PartyLiveSubscriber>();
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

const matchesFilters = (
  party: SearchPartyRow,
  filters: PartyLiveFilters,
): boolean => {
  if (filters.leagueId !== undefined && party.leagueId !== filters.leagueId) {
    return false;
  }
  if (
    filters.categoryId !== undefined &&
    party.categoryId !== filters.categoryId
  ) {
    return false;
  }
  if (
    filters.currencyId !== undefined &&
    party.currencyId !== filters.currencyId
  ) {
    return false;
  }
  if (filters.minHostRating !== undefined) {
    const meets = party.host.hostRating >= filters.minHostRating;
    const unratedOk =
      filters.includeUnrated === true && party.host.hostRating === 0;
    if (!meets && !unratedOk) {
      return false;
    }
  }
  if (filters.minPrice !== undefined && party.cost < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && party.cost > filters.maxPrice) {
    return false;
  }
  if (filters.q !== undefined && filters.q.trim() !== "") {
    const needle = filters.q.trim().toLowerCase();
    const haystack = `${party.title} ${party.description ?? ""}`.toLowerCase();
    if (!haystack.includes(needle)) {
      return false;
    }
  }

  return party.status === "Gathering";
};

const enqueue = (
  subscriber: PartyLiveSubscriber,
  event: PartyLiveEvent,
): void => {
  if (subscriber.closed) {
    return;
  }

  subscriber.queue.push(event);
  subscriber.notify?.();
  subscriber.notify = undefined;
};

const ensureHeartbeat = (): void => {
  if (heartbeatTimer !== undefined) {
    return;
  }

  heartbeatTimer = setInterval(() => {
    const event: PartyLiveEvent = {
      type: "heartbeat",
      data: { timestamp: new Date().toISOString() },
    };

    for (const subscriber of subscribers) {
      enqueue(subscriber, event);
    }
  }, 25_000);
};

const stopHeartbeatIfIdle = (): void => {
  if (subscribers.size > 0 || heartbeatTimer === undefined) {
    return;
  }

  clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
};

export const publishPartyCreated = (party: SearchPartyRow): void => {
  for (const subscriber of subscribers) {
    if (matchesFilters(party, subscriber.filters)) {
      enqueue(subscriber, {
        type: "party.created",
        data: party,
      });
    }
  }
};

export const publishPartyStatusUpdated = (
  partyId: number,
  status: string,
): void => {
  for (const subscriber of subscribers) {
    enqueue(subscriber, {
      type: "party.status.updated",
      data: { partyId, status },
    });
  }
};

export async function* subscribeToLiveParties(
  filters: PartyLiveFilters,
  signal?: AbortSignal,
): AsyncGenerator<PartyLiveEvent> {
  const subscriber: PartyLiveSubscriber = {
    filters,
    queue: [],
    closed: false,
  };
  const abort = () => {
    subscriber.closed = true;
    subscriber.notify?.();
    subscriber.notify = undefined;
  };

  subscribers.add(subscriber);
  ensureHeartbeat();
  signal?.addEventListener("abort", abort, { once: true });

  try {
    while (!subscriber.closed) {
      if (subscriber.queue.length === 0) {
        await new Promise<void>((resolve) => {
          subscriber.notify = resolve;
        });
      }

      const event = subscriber.queue.shift();

      if (event) {
        yield event;
      }
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    subscriber.closed = true;
    subscribers.delete(subscriber);
    stopHeartbeatIfIdle();
  }
}

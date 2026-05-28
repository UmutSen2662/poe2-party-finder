export interface ApplicantRow {
  playerId: number;
  partyId: number;
  ign: string;
  customerRating: number;
  customerThumbsUp: number;
  customerThumbsDown: number;
  status: "Pending" | "Accepted" | "Rejected" | "Kicked";
  appliedAt: Date;
}

export type ApplicationLiveEvent =
  | {
      type: "application.created";
      data: ApplicantRow;
    }
  | {
      type: "application.updated";
      data: ApplicantRow;
    }
  | {
      type: "party.status.updated";
      data: { partyId: number; status: string };
    }
  | {
      type: "heartbeat";
      data: { timestamp: string };
    };

interface ApplicationLiveSubscriber {
  partyId: number;
  queue: ApplicationLiveEvent[];
  closed: boolean;
  notify?: () => void;
}

const subscribers = new Set<ApplicationLiveSubscriber>();
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

const enqueue = (
  subscriber: ApplicationLiveSubscriber,
  event: ApplicationLiveEvent,
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
    const event: ApplicationLiveEvent = {
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

export const publishApplicationCreated = (applicant: ApplicantRow): void => {
  for (const subscriber of subscribers) {
    if (subscriber.partyId === applicant.partyId) {
      enqueue(subscriber, {
        type: "application.created",
        data: applicant,
      });
    }
  }
};

export const publishApplicationUpdated = (applicant: ApplicantRow): void => {
  for (const subscriber of subscribers) {
    if (subscriber.partyId === applicant.partyId) {
      enqueue(subscriber, {
        type: "application.updated",
        data: applicant,
      });
    }
  }
};

export const publishPartyStatusUpdated = (
  partyId: number,
  status: string,
): void => {
  for (const subscriber of subscribers) {
    if (subscriber.partyId === partyId) {
      enqueue(subscriber, {
        type: "party.status.updated",
        data: { partyId, status },
      });
    }
  }
};

export async function* subscribeToLiveApplications(
  partyId: number,
  signal?: AbortSignal,
): AsyncGenerator<ApplicationLiveEvent> {
  const subscriber: ApplicationLiveSubscriber = {
    partyId,
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

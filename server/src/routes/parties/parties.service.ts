import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "../../db";
import {
  applies,
  categories,
  currencies,
  leagues,
  parties,
  players,
} from "../../db/schema";
import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors";
import { publishPartyCreated } from "../../lib/party-live-events";
import {
  fromPublicPartyStatus,
  type PublicPartyStatus,
  toPublicApplicationStatus,
  toPublicPartyStatus,
  toPublicStatus,
} from "../../lib/status";

type PartyRecord = typeof parties.$inferSelect;

export interface PartyRow {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  capacity: number;
  status: PublicPartyStatus;
  cost: number;
  hostId: number | null;
  leagueId: number;
  categoryId: number;
  currencyId: number;
}

export interface SearchPartyRow extends PartyRow {
  acceptedCount: number;
  host: {
    id: number;
    ign: string;
    hostRating: number;
    hostThumbsUp: number;
    hostThumbsDown: number;
  };
  league: {
    id: number;
    name: string;
    status: "Active" | "Inactive";
  };
  category: {
    id: number;
    name: string;
    image: string | null;
    status: "Active" | "Inactive";
  };
  currency: {
    id: number;
    name: string;
    icon: string | null;
  };
}

const toPartyRow = (party: PartyRecord): PartyRow => ({
  id: party.id,
  title: party.title,
  description: party.description,
  createdAt: party.createdAt,
  capacity: party.capacity,
  status: toPublicPartyStatus(party.status),
  cost: party.cost,
  hostId: party.hostId,
  leagueId: party.leagueId,
  categoryId: party.categoryId,
  currencyId: party.currencyId,
});

const toSearchPartyRow = ({
  party,
  host,
  league,
  category,
  currency,
  acceptedCount,
}: {
  party: PartyRecord;
  host: typeof players.$inferSelect;
  league: typeof leagues.$inferSelect;
  category: typeof categories.$inferSelect;
  currency: typeof currencies.$inferSelect;
  acceptedCount: number;
}): SearchPartyRow => ({
  ...toPartyRow(party),
  acceptedCount,
  host: {
    id: host.id,
    ign: host.ign,
    hostRating: host.hostRating,
    hostThumbsUp: host.hostThumbsUp,
    hostThumbsDown: host.hostThumbsDown,
  },
  league: {
    id: league.id,
    name: league.name,
    status: toPublicStatus(league.status),
  },
  category: {
    id: category.id,
    name: category.displayName,
    image: category.imagePath,
    status: toPublicStatus(category.status),
  },
  currency: {
    id: currency.id,
    name: currency.name,
    icon: currency.icon,
  },
});

const getPartyRecord = async (partyId: number): Promise<PartyRecord> => {
  const [party] = await db
    .select()
    .from(parties)
    .where(eq(parties.id, partyId))
    .limit(1);

  if (!party) {
    throw new NotFoundError("Party not found");
  }

  return party;
};

const assertPartyHost = (
  party: Pick<PartyRecord, "hostId">,
  hostId: number,
): void => {
  if (party.hostId !== hostId) {
    throw new ForbiddenError("Only the party host can perform this action");
  }
};

export const searchParties = async (
  filters: {
    leagueId?: number;
    categoryId?: number;
    currencyId?: number;
    minHostRating?: number;
    includeUnrated?: boolean;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    excludeHostId?: number;
  } = {},
): Promise<SearchPartyRow[]> => {
  try {
    const conditions = [eq(parties.status, "gathering")];

    if (filters.excludeHostId !== undefined) {
      conditions.push(sql`${parties.hostId} != ${filters.excludeHostId}`);
    }
    if (filters.leagueId !== undefined) {
      conditions.push(eq(parties.leagueId, filters.leagueId));
    }
    if (filters.categoryId !== undefined) {
      conditions.push(eq(parties.categoryId, filters.categoryId));
    }
    if (filters.currencyId !== undefined) {
      conditions.push(eq(parties.currencyId, filters.currencyId));
    }
    if (filters.minHostRating !== undefined) {
      // A host passes the rating gate when they meet the threshold,
      // or — if the client opted in — when they are unrated (rating = 0).
      const meetsRating = gte(players.hostRating, filters.minHostRating);
      if (filters.includeUnrated) {
        const unratedCondition = or(meetsRating, eq(players.hostRating, 0));
        if (unratedCondition) conditions.push(unratedCondition);
      } else {
        conditions.push(meetsRating);
      }
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(parties.cost, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(parties.cost, filters.maxPrice));
    }
    if (filters.q !== undefined && filters.q.trim() !== "") {
      const pattern = `%${filters.q.trim()}%`;
      const textMatch = or(
        ilike(parties.title, pattern),
        ilike(parties.description, pattern),
      );
      if (textMatch) conditions.push(textMatch);
    }

    const acceptedCountSql = sql<number>`(
      select count(*)::int from ${applies}
      where ${applies.partyId} = ${parties.id}
        and ${applies.status} = 'accepted'
    )`;

    const rows = await db
      .select({
        party: parties,
        host: players,
        league: leagues,
        category: categories,
        currency: currencies,
        acceptedCount: acceptedCountSql,
      })
      .from(parties)
      .innerJoin(players, eq(parties.hostId, players.id))
      .innerJoin(leagues, eq(parties.leagueId, leagues.id))
      .innerJoin(categories, eq(parties.categoryId, categories.id))
      .innerJoin(currencies, eq(parties.currencyId, currencies.id))
      .where(and(...conditions))
      .orderBy(desc(parties.createdAt));

    return rows.map(toSearchPartyRow);
  } catch (error) {
    console.error("Database error in searchParties:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "searchParties",
      context: filters,
    });
    throw new DatabaseError("Failed to search parties");
  }
};

export const getSearchPartyById = async (
  partyId: number,
): Promise<SearchPartyRow> => {
  try {
    const acceptedCountSql = sql<number>`(
      select count(*)::int from ${applies}
      where ${applies.partyId} = ${parties.id}
        and ${applies.status} = 'accepted'
    )`;

    const [row] = await db
      .select({
        party: parties,
        host: players,
        league: leagues,
        category: categories,
        currency: currencies,
        acceptedCount: acceptedCountSql,
      })
      .from(parties)
      .innerJoin(players, eq(parties.hostId, players.id))
      .innerJoin(leagues, eq(parties.leagueId, leagues.id))
      .innerJoin(categories, eq(parties.categoryId, categories.id))
      .innerJoin(currencies, eq(parties.currencyId, currencies.id))
      .where(eq(parties.id, partyId))
      .limit(1);

    if (!row) {
      throw new NotFoundError("Party not found");
    }

    return toSearchPartyRow(row);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getSearchPartyById:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getSearchPartyById",
      context: { partyId },
    });
    throw new DatabaseError("Failed to fetch party");
  }
};

export const getPartyById = async (id: number): Promise<PartyRow> => {
  try {
    return toPartyRow(await getPartyRecord(id));
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getPartyById:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPartyById",
      context: { partyId: id },
    });
    throw new DatabaseError("Failed to fetch party");
  }
};

export const createParty = async (data: {
  title: string;
  description?: string;
  capacity: number;
  cost: number;
  hostId: number;
  leagueId: number;
  categoryId: number;
  currencyId: number;
}): Promise<PartyRow> => {
  if (data.capacity <= 0) {
    throw new ValidationError("Capacity must be greater than zero");
  }
  if (data.cost < 0) {
    throw new ValidationError("Cost cannot be negative");
  }

  try {
    const [activeParty] = await db
      .select({ id: parties.id })
      .from(parties)
      .where(
        and(
          eq(parties.hostId, data.hostId),
          sql`${parties.status} in ('gathering', 'started')`,
        ),
      )
      .limit(1);

    if (activeParty) {
      throw new ConflictError("Host already has an active party");
    }

    const [party] = await db
      .insert(parties)
      .values({
        title: data.title,
        description: data.description ?? null,
        capacity: data.capacity,
        cost: data.cost,
        hostId: data.hostId,
        leagueId: data.leagueId,
        categoryId: data.categoryId,
        currencyId: data.currencyId,
      })
      .returning();

    const createdParty = toPartyRow(party);
    const searchableParty = await getSearchPartyById(createdParty.id);
    publishPartyCreated(searchableParty);

    return createdParty;
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    console.error("Database error in createParty:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createParty",
      context: { hostId: data.hostId, title: data.title },
    });
    throw new DatabaseError("Failed to create party");
  }
};

export const updatePartyStatus = async (
  id: number,
  status: PublicPartyStatus,
  hostId: number,
): Promise<PartyRow> => {
  try {
    console.log("updatePartyStatus called:", { id, status, hostId });
    const existingParty = await getPartyRecord(id);
    console.log("Existing party:", existingParty);
    assertPartyHost(existingParty, hostId);

    const [party] = await db
      .update(parties)
      .set({ status: fromPublicPartyStatus(status) })
      .where(eq(parties.id, id))
      .returning();

    if (!party) {
      throw new NotFoundError("Party not found");
    }

    return toPartyRow(party);
  } catch (error) {
    console.error("Error in updatePartyStatus:", error);
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error("Database error in updatePartyStatus:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updatePartyStatus",
      context: { partyId: id, status, hostId },
    });
    throw new DatabaseError("Failed to update party status");
  }
};

export const cancelParty = async (
  id: number,
  hostId: number,
): Promise<PartyRow> => {
  try {
    const existingParty = await getPartyRecord(id);
    assertPartyHost(existingParty, hostId);

    const [party] = await db
      .delete(parties)
      .where(eq(parties.id, id))
      .returning();

    if (!party) {
      throw new NotFoundError("Party not found");
    }

    return toPartyRow(party);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error("Database error in cancelParty:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "cancelParty",
      context: { partyId: id, hostId },
    });
    throw new DatabaseError("Failed to cancel party");
  }
};

export const getPartyApplications = async (
  partyId: number,
  hostId: number,
  pendingOnly = false,
) => {
  try {
    const party = await getPartyRecord(partyId);
    assertPartyHost(party, hostId);

    const conditions = [eq(applies.partyId, partyId)];

    if (pendingOnly) {
      conditions.push(eq(applies.status, "pending"));
    }

    const rows = await db
      .select({
        application: applies,
        player: players,
      })
      .from(applies)
      .innerJoin(players, eq(applies.playerId, players.id))
      .where(and(...conditions))
      .orderBy(applies.appliedAt);

    return rows.map(({ application, player }) => ({
      playerId: player.id,
      partyId: application.partyId,
      ign: player.ign,
      customerRating: player.customerRating,
      customerThumbsUp: player.customerThumbsUp,
      customerThumbsDown: player.customerThumbsDown,
      status: toPublicApplicationStatus(application.status),
      appliedAt: application.appliedAt,
    }));
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error("Database error in getPartyApplications:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPartyApplications",
      context: { partyId, hostId, pendingOnly },
    });
    throw new DatabaseError("Failed to fetch party applications");
  }
};

export const getPartyRatingTargets = async (
  partyId: number,
  hostId: number,
) => {
  try {
    const party = await getPartyRecord(partyId);
    assertPartyHost(party, hostId);

    if (party.status !== "ended") {
      throw new ValidationError(
        "Party must be ended before rating targets are listed",
      );
    }

    const rows = await db
      .select({
        application: applies,
        player: players,
      })
      .from(applies)
      .innerJoin(players, eq(applies.playerId, players.id))
      .where(
        and(
          eq(applies.partyId, partyId),
          sql`${applies.status} in ('accepted', 'kicked')`,
        ),
      )
      .orderBy(applies.appliedAt);

    return rows.map(({ application, player }) => ({
      playerId: player.id,
      partyId: application.partyId,
      ign: player.ign,
      status: toPublicApplicationStatus(application.status),
      customerRating: player.customerRating,
    }));
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }
    console.error("Database error in getPartyRatingTargets:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPartyRatingTargets",
      context: { partyId, hostId },
    });
    throw new DatabaseError("Failed to fetch rating targets");
  }
};

export const getWhisperMessage = async (
  partyId: number,
  customerId?: number,
) => {
  try {
    if (customerId !== undefined) {
      const [application] = await db
        .select()
        .from(applies)
        .where(
          and(
            eq(applies.partyId, partyId),
            eq(applies.playerId, customerId),
            eq(applies.status, "accepted"),
          ),
        )
        .limit(1);

      if (!application) {
        throw new ValidationError(
          "Only accepted customers can access the whisper",
        );
      }
    }

    const [row] = await db
      .select({
        party: parties,
        host: players,
        category: categories,
        currency: currencies,
      })
      .from(parties)
      .innerJoin(players, eq(parties.hostId, players.id))
      .innerJoin(categories, eq(parties.categoryId, categories.id))
      .innerJoin(currencies, eq(parties.currencyId, currencies.id))
      .where(eq(parties.id, partyId))
      .limit(1);

    if (!row) {
      throw new NotFoundError("Party not found");
    }

    return {
      whisperMessage: `@${row.host.ign} Hi, I would like to join your ${row.category.displayName} party for ${row.party.cost} ${row.currency.name}`,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getWhisperMessage:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getWhisperMessage",
      context: { partyId, customerId },
    });
    throw new DatabaseError("Failed to create whisper message");
  }
};

export const getActivePartyForHost = async (
  hostId: number,
): Promise<PartyRow | null> => {
  try {
    const [party] = await db
      .select()
      .from(parties)
      .where(
        and(
          eq(parties.hostId, hostId),
          sql`${parties.status} in ('gathering', 'started')`,
        ),
      )
      .limit(1);

    return party ? toPartyRow(party) : null;
  } catch (error) {
    console.error("Database error in getActivePartyForHost:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getActivePartyForHost",
      context: { hostId },
    });
    throw new DatabaseError("Failed to check active party");
  }
};

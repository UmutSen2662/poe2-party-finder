import { and, desc, eq, or } from "drizzle-orm";
import { db } from "../../db";
import {
  applies,
  badges,
  earns,
  parties,
  players,
  type ServiceTemplate,
} from "../../db/schema";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors";
import {
  toPublicApplicationStatus,
  toPublicPartyStatus,
} from "../../lib/status";

type PlayerRecord = typeof players.$inferSelect;

export interface PlayerRow {
  id: number;
  ign: string;
  oauth2: string | null;
  templates: ServiceTemplate[];
  hostRating: number;
  customerRating: number;
  hostThumbsUp: number;
  hostThumbsDown: number;
  customerThumbsUp: number;
  customerThumbsDown: number;
}

const toPlayerRow = (player: PlayerRecord): PlayerRow => ({
  id: player.id,
  ign: player.ign,
  oauth2: player.oauth2,
  templates: player.templates,
  hostRating: player.hostRating,
  customerRating: player.customerRating,
  hostThumbsUp: player.hostThumbsUp,
  hostThumbsDown: player.hostThumbsDown,
  customerThumbsUp: player.customerThumbsUp,
  customerThumbsDown: player.customerThumbsDown,
});

export const getAllPlayers = async (): Promise<PlayerRow[]> => {
  try {
    const rows = await db.select().from(players).orderBy(desc(players.id));
    return rows.map(toPlayerRow);
  } catch (error) {
    console.error("Database error in getAllPlayers:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllPlayers",
    });
    throw new DatabaseError("Failed to fetch players");
  }
};

export const getPlayerById = async (id: number): Promise<PlayerRow> => {
  try {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    if (!player) {
      throw new NotFoundError("Player not found");
    }

    return toPlayerRow(player);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getPlayerById:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPlayerById",
      context: { playerId: id },
    });
    throw new DatabaseError("Failed to fetch player");
  }
};

export const createPlayer = async (data: {
  ign: string;
  oauth2: string;
  templates?: ServiceTemplate[];
}): Promise<PlayerRow> => {
  try {
    const [player] = await db
      .insert(players)
      .values({
        ign: data.ign,
        oauth2: data.oauth2,
        templates: data.templates ?? [],
      })
      .returning();

    return toPlayerRow(player);
  } catch (error) {
    console.error("Database error in createPlayer:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createPlayer",
      context: { ign: data.ign },
    });
    throw new DatabaseError("Failed to create player");
  }
};

export const updatePlayer = async (
  id: number,
  data: {
    ign?: string;
    oauth2?: string;
    templates?: ServiceTemplate[];
  },
): Promise<PlayerRow> => {
  try {
    const updateData: Partial<typeof players.$inferInsert> = {};

    if (data.ign !== undefined) {
      updateData.ign = data.ign;
    }
    if (data.oauth2 !== undefined) {
      updateData.oauth2 = data.oauth2;
    }
    if (data.templates !== undefined) {
      updateData.templates = data.templates;
    }

    if (Object.keys(updateData).length === 0) {
      return getPlayerById(id);
    }

    const [player] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();

    if (!player) {
      throw new NotFoundError("Player not found");
    }

    return toPlayerRow(player);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in updatePlayer:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updatePlayer",
      context: { playerId: id },
    });
    throw new DatabaseError("Failed to update player");
  }
};

export const addPlayerTemplate = async (
  id: number,
  template: ServiceTemplate,
): Promise<PlayerRow> => {
  const player = await getPlayerById(id);
  return updatePlayer(id, { templates: [...player.templates, template] });
};

export const updatePlayerTemplate = async (
  id: number,
  index: number,
  template: ServiceTemplate,
): Promise<PlayerRow> => {
  const player = await getPlayerById(id);

  if (index < 0 || index >= player.templates.length) {
    throw new ValidationError("Template index is out of range");
  }

  const templates = [...player.templates];
  templates[index] = template;
  return updatePlayer(id, { templates });
};

export const deletePlayerTemplate = async (
  id: number,
  index: number,
): Promise<PlayerRow> => {
  const player = await getPlayerById(id);

  if (index < 0 || index >= player.templates.length) {
    throw new ValidationError("Template index is out of range");
  }

  return updatePlayer(id, {
    templates: player.templates.filter(
      (_, templateIndex) => templateIndex !== index,
    ),
  });
};

export const getPlayerBadges = async (playerId: number) => {
  try {
    const rows = await db
      .select({
        badge: badges,
        earnedBadge: earns,
      })
      .from(earns)
      .innerJoin(badges, eq(earns.badgeId, badges.id))
      .where(eq(earns.playerId, playerId))
      .orderBy(desc(earns.pinned), badges.name);

    return rows.map((row) => ({
      id: row.badge.id,
      name: row.badge.name,
      icon: row.badge.icon,
      description: row.badge.description,
      condition: row.badge.condition,
      pinned: row.earnedBadge.pinned,
    }));
  } catch (error) {
    console.error("Database error in getPlayerBadges:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPlayerBadges",
      context: { playerId },
    });
    throw new DatabaseError("Failed to fetch player badges");
  }
};

export const pinPlayerBadge = async (
  playerId: number,
  badgeId: number,
): Promise<{ playerId: number; badgeId: number; pinned: boolean }> => {
  try {
    const [earnedBadge] = await db
      .select()
      .from(earns)
      .where(and(eq(earns.playerId, playerId), eq(earns.badgeId, badgeId)))
      .limit(1);

    if (!earnedBadge) {
      throw new NotFoundError("Earned badge not found");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(earns)
        .set({ pinned: false })
        .where(eq(earns.playerId, playerId));
      await tx
        .update(earns)
        .set({ pinned: true })
        .where(and(eq(earns.playerId, playerId), eq(earns.badgeId, badgeId)));
    });

    return { playerId, badgeId, pinned: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in pinPlayerBadge:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "pinPlayerBadge",
      context: { playerId, badgeId },
    });
    throw new DatabaseError("Failed to pin badge");
  }
};

export const getPlayerHistory = async (playerId: number) => {
  try {
    const hosted = await db
      .select()
      .from(parties)
      .where(eq(parties.hostId, playerId))
      .orderBy(desc(parties.createdAt));

    const joined = await db
      .select({
        party: parties,
        application: applies,
      })
      .from(applies)
      .innerJoin(parties, eq(applies.partyId, parties.id))
      .where(
        and(
          eq(applies.playerId, playerId),
          or(eq(applies.status, "accepted"), eq(applies.status, "kicked")),
        ),
      )
      .orderBy(desc(parties.createdAt));

    return {
      hosted: hosted.map((party) => ({
        ...party,
        status: toPublicPartyStatus(party.status),
      })),
      joined: joined.map(({ party, application }) => ({
        party: {
          ...party,
          status: toPublicPartyStatus(party.status),
        },
        applicationStatus: toPublicApplicationStatus(application.status),
        appliedAt: application.appliedAt,
      })),
    };
  } catch (error) {
    console.error("Database error in getPlayerHistory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPlayerHistory",
      context: { playerId },
    });
    throw new DatabaseError("Failed to fetch player history");
  }
};

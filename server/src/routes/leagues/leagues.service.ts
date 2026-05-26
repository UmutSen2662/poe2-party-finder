import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { leagues } from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";
import {
  fromPublicStatus,
  type PublicStatus,
  toPublicStatus,
} from "../../lib/status";

type LeagueRecord = typeof leagues.$inferSelect;

export interface LeagueRow {
  id: number;
  name: string;
  status: PublicStatus;
}

const toLeagueRow = (league: LeagueRecord): LeagueRow => ({
  id: league.id,
  name: league.name,
  status: toPublicStatus(league.status),
});

export const getAllLeagues = async (
  activeOnly = false,
): Promise<LeagueRow[]> => {
  try {
    const rows = activeOnly
      ? await db
          .select()
          .from(leagues)
          .where(eq(leagues.status, "active"))
          .orderBy(desc(leagues.id))
      : await db.select().from(leagues).orderBy(desc(leagues.id));

    return rows.map(toLeagueRow);
  } catch (error) {
    console.error("Database error in getAllLeagues:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllLeagues",
      context: { activeOnly },
    });
    throw new DatabaseError("Failed to fetch leagues");
  }
};

export const createLeague = async (data: {
  name: string;
  status?: PublicStatus;
}): Promise<LeagueRow> => {
  try {
    const [league] = await db
      .insert(leagues)
      .values({
        name: data.name,
        status: fromPublicStatus(data.status ?? "Active"),
      })
      .returning();

    return toLeagueRow(league);
  } catch (error) {
    console.error("Database error in createLeague:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createLeague",
      context: { name: data.name },
    });
    throw new DatabaseError("Failed to create league");
  }
};

export const updateLeague = async (
  id: number,
  data: { name?: string; status?: PublicStatus },
): Promise<LeagueRow> => {
  try {
    const updateData: Partial<typeof leagues.$inferInsert> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.status !== undefined) {
      updateData.status = fromPublicStatus(data.status);
    }

    const [league] = await db
      .update(leagues)
      .set(updateData)
      .where(eq(leagues.id, id))
      .returning();

    if (!league) {
      throw new NotFoundError("League not found");
    }

    return toLeagueRow(league);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in updateLeague:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updateLeague",
      context: { leagueId: id },
    });
    throw new DatabaseError("Failed to update league");
  }
};

export const deleteLeague = (id: number): Promise<LeagueRow> =>
  updateLeague(id, { status: "Inactive" });

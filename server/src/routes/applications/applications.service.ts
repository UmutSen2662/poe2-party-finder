import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { applies, parties } from "../../db/schema";
import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors";
import {
  fromPublicApplicationStatus,
  type PublicApplicationStatus,
  toPublicApplicationStatus,
} from "../../lib/status";

type ApplicationRecord = typeof applies.$inferSelect;

export interface ApplicationRow {
  playerId: number;
  partyId: number;
  status: PublicApplicationStatus;
  appliedAt: Date;
}

const toApplicationRow = (application: ApplicationRecord): ApplicationRow => ({
  playerId: application.playerId,
  partyId: application.partyId,
  status: toPublicApplicationStatus(application.status),
  appliedAt: application.appliedAt,
});

const getApplicationRecord = async (
  playerId: number,
  partyId: number,
): Promise<ApplicationRecord | undefined> => {
  const [application] = await db
    .select()
    .from(applies)
    .where(and(eq(applies.playerId, playerId), eq(applies.partyId, partyId)))
    .limit(1);

  return application;
};

export const createApplication = async (data: {
  playerId: number;
  partyId: number;
}): Promise<ApplicationRow> => {
  try {
    const [party] = await db
      .select()
      .from(parties)
      .where(eq(parties.id, data.partyId))
      .limit(1);

    if (!party) {
      throw new NotFoundError("Party not found");
    }
    if (party.status !== "gathering") {
      throw new ValidationError(
        "Applications are only open while party is gathering",
      );
    }
    if (party.hostId === data.playerId) {
      throw new ValidationError("Hosts cannot apply to their own party");
    }

    const existingApplication = await getApplicationRecord(
      data.playerId,
      data.partyId,
    );

    if (existingApplication?.status === "kicked") {
      throw new ConflictError(
        "Kicked players cannot reapply to the same party",
      );
    }
    if (existingApplication) {
      throw new ConflictError("Player already applied to this party");
    }

    const [application] = await db
      .insert(applies)
      .values({
        playerId: data.playerId,
        partyId: data.partyId,
      })
      .returning();

    return toApplicationRow(application);
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ValidationError ||
      error instanceof ConflictError
    ) {
      throw error;
    }
    console.error("Database error in createApplication:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createApplication",
      context: data,
    });
    throw new DatabaseError("Failed to create application");
  }
};

export const updateApplicationStatus = async (
  playerId: number,
  partyId: number,
  status: PublicApplicationStatus,
  hostId: number,
): Promise<ApplicationRow> => {
  try {
    const [party] = await db
      .select({
        id: parties.id,
        capacity: parties.capacity,
        hostId: parties.hostId,
        status: parties.status,
      })
      .from(parties)
      .where(eq(parties.id, partyId))
      .limit(1);

    if (!party) {
      throw new NotFoundError("Party not found");
    }
    if (party.hostId !== hostId) {
      throw new ForbiddenError("Only the party host can update applications");
    }
    if (status === "Accepted") {
      const [acceptedCount] = await db
        .select({
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(applies)
        .where(
          and(eq(applies.partyId, partyId), eq(applies.status, "accepted")),
        );

      if ((acceptedCount?.count ?? 0) >= party.capacity) {
        throw new ConflictError("Party is already full");
      }
    }

    const [application] = await db
      .update(applies)
      .set({ status: fromPublicApplicationStatus(status) })
      .where(and(eq(applies.playerId, playerId), eq(applies.partyId, partyId)))
      .returning();

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    return toApplicationRow(application);
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ConflictError ||
      error instanceof ValidationError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }
    console.error("Database error in updateApplicationStatus:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updateApplicationStatus",
      context: { playerId, partyId, status, hostId },
    });
    throw new DatabaseError("Failed to update application");
  }
};

export const deleteApplication = async (
  playerId: number,
  partyId: number,
  requesterPlayerId: number,
): Promise<ApplicationRow> => {
  if (requesterPlayerId !== playerId) {
    throw new ForbiddenError("Only the applicant can leave their queue entry");
  }

  try {
    const [application] = await db
      .delete(applies)
      .where(
        and(
          eq(applies.playerId, playerId),
          eq(applies.partyId, partyId),
          eq(applies.status, "pending"),
        ),
      )
      .returning();

    if (!application) {
      throw new NotFoundError("Pending application not found");
    }

    return toApplicationRow(application);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error("Database error in deleteApplication:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deleteApplication",
      context: { playerId, partyId, requesterPlayerId },
    });
    throw new DatabaseError("Failed to delete application");
  }
};

export const getPlayerApplicationStatus = async (
  playerId: number,
  partyId: number,
): Promise<ApplicationRow> => {
  try {
    const application = await getApplicationRecord(playerId, partyId);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    return toApplicationRow(application);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getPlayerApplicationStatus:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPlayerApplicationStatus",
      context: { playerId, partyId },
    });
    throw new DatabaseError("Failed to fetch application status");
  }
};

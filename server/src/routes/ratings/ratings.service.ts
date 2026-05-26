import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { applies, parties, players, ratings } from "../../db/schema";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors";

type RatingRecord = typeof ratings.$inferSelect;

export interface RatingRow {
  id: number;
  value: 1 | -1;
  timestamp: Date;
  giverId: number | null;
  receiverId: number | null;
  partyId: number | null;
  direction: "Host-to-Customer" | "Customer-to-Host";
}

const wilsonScore = (up: number, down: number): number => {
  const total = up + down;

  if (total === 0) {
    return 0;
  }

  const z = 1.96;
  const phat = up / total;
  const score =
    (phat +
      (z * z) / (2 * total) -
      z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total)) /
    (1 + (z * z) / total);

  return Number((score * 100).toFixed(2));
};

const toRatingRow = (
  rating: RatingRecord,
  hostId: number | null,
): RatingRow => ({
  id: rating.id,
  value: rating.value as 1 | -1,
  timestamp: rating.timestamp,
  giverId: rating.giverId,
  receiverId: rating.receiverId,
  partyId: rating.partyId,
  direction:
    rating.giverId === hostId ? "Host-to-Customer" : "Customer-to-Host",
});

const assertPlayerInParty = async (
  playerId: number,
  partyId: number,
  hostId: number | null,
): Promise<void> => {
  if (playerId === hostId) {
    return;
  }

  const [application] = await db
    .select()
    .from(applies)
    .where(
      and(
        eq(applies.playerId, playerId),
        eq(applies.partyId, partyId),
        sql`${applies.status} in ('accepted', 'kicked')`,
      ),
    )
    .limit(1);

  if (!application) {
    throw new ValidationError("Ratings can only involve party participants");
  }
};

export const createRating = async (data: {
  value: 1 | -1;
  giverId: number;
  receiverId: number;
  partyId: number;
}): Promise<RatingRow> => {
  if (data.giverId === data.receiverId) {
    throw new ValidationError("Players cannot rate themselves");
  }

  try {
    const [party] = await db
      .select()
      .from(parties)
      .where(eq(parties.id, data.partyId))
      .limit(1);

    if (!party) {
      throw new NotFoundError("Party not found");
    }
    if (party.status !== "ended") {
      throw new ValidationError(
        "Ratings can only be submitted after a party ends",
      );
    }

    await assertPlayerInParty(data.giverId, data.partyId, party.hostId);
    await assertPlayerInParty(data.receiverId, data.partyId, party.hostId);

    const rating = await db.transaction(async (tx) => {
      const [createdRating] = await tx.insert(ratings).values(data).returning();

      const [receiver] = await tx
        .select()
        .from(players)
        .where(eq(players.id, data.receiverId))
        .limit(1);

      if (!receiver) {
        throw new NotFoundError("Receiver not found");
      }

      if (data.receiverId === party.hostId) {
        const hostThumbsUp = receiver.hostThumbsUp + (data.value === 1 ? 1 : 0);
        const hostThumbsDown =
          receiver.hostThumbsDown + (data.value === -1 ? 1 : 0);

        await tx
          .update(players)
          .set({
            hostThumbsUp,
            hostThumbsDown,
            hostRating: wilsonScore(hostThumbsUp, hostThumbsDown),
          })
          .where(eq(players.id, data.receiverId));
      } else {
        const customerThumbsUp =
          receiver.customerThumbsUp + (data.value === 1 ? 1 : 0);
        const customerThumbsDown =
          receiver.customerThumbsDown + (data.value === -1 ? 1 : 0);

        await tx
          .update(players)
          .set({
            customerThumbsUp,
            customerThumbsDown,
            customerRating: wilsonScore(customerThumbsUp, customerThumbsDown),
          })
          .where(eq(players.id, data.receiverId));
      }

      return createdRating;
    });

    return toRatingRow(rating, party.hostId);
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ValidationError ||
      error instanceof ConflictError
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("ratings_giver_receiver_party_unique")) {
      throw new ConflictError("This rating has already been submitted");
    }

    console.error("Database error in createRating:", {
      error: message,
      operation: "createRating",
      context: data,
    });
    throw new DatabaseError("Failed to create rating");
  }
};

export const getPartyRatings = async (
  partyId: number,
): Promise<RatingRow[]> => {
  try {
    const [party] = await db
      .select()
      .from(parties)
      .where(eq(parties.id, partyId))
      .limit(1);

    if (!party) {
      throw new NotFoundError("Party not found");
    }

    const rows = await db
      .select()
      .from(ratings)
      .where(eq(ratings.partyId, partyId));

    return rows.map((rating) => toRatingRow(rating, party.hostId));
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getPartyRatings:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPartyRatings",
      context: { partyId },
    });
    throw new DatabaseError("Failed to fetch ratings");
  }
};

import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { badgeCategories, badges, earns } from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";

type BadgeRecord = typeof badges.$inferSelect;

const toBadgeRow = (badge: BadgeRecord) => ({
  id: badge.id,
  name: badge.name,
  icon: badge.icon,
  description: badge.description,
  condition: badge.condition,
});

export const getAllBadges = async () => {
  try {
    const rows = await db.select().from(badges).orderBy(asc(badges.name));
    return rows.map(toBadgeRow);
  } catch (error) {
    console.error("Database error in getAllBadges:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllBadges",
    });
    throw new DatabaseError("Failed to fetch badges");
  }
};

export const getBadgesByCategory = async (categoryId: number) => {
  try {
    const rows = await db
      .select({ badge: badges })
      .from(badgeCategories)
      .innerJoin(badges, eq(badgeCategories.badgeId, badges.id))
      .where(eq(badgeCategories.categoryId, categoryId))
      .orderBy(asc(badges.name));

    return rows.map(({ badge }) => toBadgeRow(badge));
  } catch (error) {
    console.error("Database error in getBadgesByCategory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getBadgesByCategory",
      context: { categoryId },
    });
    throw new DatabaseError("Failed to fetch category badges");
  }
};

export const createBadge = async (data: {
  name: string;
  icon?: string;
  description?: string;
  condition: Record<string, unknown>;
  categoryIds?: number[];
}) => {
  try {
    const badge = await db.transaction(async (tx) => {
      const [createdBadge] = await tx
        .insert(badges)
        .values({
          name: data.name,
          icon: data.icon ?? null,
          description: data.description ?? null,
          condition: data.condition,
        })
        .returning();

      if (data.categoryIds?.length) {
        await tx.insert(badgeCategories).values(
          data.categoryIds.map((categoryId) => ({
            badgeId: createdBadge.id,
            categoryId,
          })),
        );
      }

      return createdBadge;
    });

    return toBadgeRow(badge);
  } catch (error) {
    console.error("Database error in createBadge:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createBadge",
      context: { name: data.name, categoryIds: data.categoryIds },
    });
    throw new DatabaseError("Failed to create badge");
  }
};

export const awardBadge = async (data: {
  playerId: number;
  badgeId: number;
  pinned?: boolean;
}) => {
  try {
    const [earnedBadge] = await db
      .insert(earns)
      .values({
        playerId: data.playerId,
        badgeId: data.badgeId,
        pinned: data.pinned ?? false,
      })
      .returning();

    return earnedBadge;
  } catch (error) {
    console.error("Database error in awardBadge:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "awardBadge",
      context: data,
    });
    throw new DatabaseError("Failed to award badge");
  }
};

export const deleteBadge = async (id: number) => {
  try {
    const [badge] = await db
      .delete(badges)
      .where(eq(badges.id, id))
      .returning();

    if (!badge) {
      throw new NotFoundError("Badge not found");
    }

    return toBadgeRow(badge);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in deleteBadge:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deleteBadge",
      context: { badgeId: id },
    });
    throw new DatabaseError("Failed to delete badge");
  }
};

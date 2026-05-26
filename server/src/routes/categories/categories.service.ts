import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { categories } from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";
import { fromPublicStatus, toPublicStatus } from "../../lib/status";

export type CategoryStatus = "Active" | "Inactive";

type CategoryRecord = typeof categories.$inferSelect;

export interface CategoryRow {
  id: number;
  name: string;
  image: string | null;
  status: CategoryStatus;
}

const toCategoryStatus = (status: CategoryRecord["status"]): CategoryStatus =>
  toPublicStatus(status);

const fromCategoryStatus = (status: CategoryStatus): CategoryRecord["status"] =>
  fromPublicStatus(status);

const toCategoryRow = (category: CategoryRecord): CategoryRow => ({
  id: category.id,
  name: category.displayName,
  image: category.imagePath,
  status: toCategoryStatus(category.status),
});

const getCategoryRecord = async (
  id: number,
): Promise<CategoryRecord | undefined> => {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category;
};

export const getAllCategories = async (): Promise<CategoryRow[]> => {
  try {
    const categoryRows = await db
      .select()
      .from(categories)
      .where(eq(categories.status, "active"))
      .orderBy(desc(categories.id));

    return categoryRows.map(toCategoryRow);
  } catch (error) {
    console.error("Database error in getAllCategories:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllCategories",
    });
    throw new DatabaseError("Failed to fetch categories");
  }
};

export const createCategory = async (data: {
  name: string;
  image?: string;
  status?: CategoryStatus;
}): Promise<CategoryRow> => {
  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        displayName: data.name,
        imagePath: data.image ?? null,
        status: fromCategoryStatus(data.status ?? "Active"),
      })
      .returning();

    return toCategoryRow(newCategory);
  } catch (error) {
    console.error("Database error in createCategory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createCategory",
      data: { name: data.name, hasImage: !!data.image },
    });
    throw new DatabaseError("Failed to create category");
  }
};

export const updateCategory = async (
  id: number,
  data: {
    name?: string;
    image?: string;
    status?: CategoryStatus;
  },
): Promise<CategoryRow> => {
  try {
    const updateData: Partial<typeof categories.$inferInsert> = {};

    if (data.name !== undefined) {
      updateData.displayName = data.name;
    }

    if (data.image !== undefined) {
      updateData.imagePath = data.image;
    }

    if (data.status !== undefined) {
      updateData.status = fromCategoryStatus(data.status);
    }

    const [updatedCategory] =
      Object.keys(updateData).length === 0
        ? [await getCategoryRecord(id)]
        : await db
            .update(categories)
            .set(updateData)
            .where(eq(categories.id, id))
            .returning();

    if (!updatedCategory) {
      throw new NotFoundError("Category not found");
    }

    return toCategoryRow(updatedCategory);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in updateCategory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updateCategory",
      categoryId: id,
      updateData: data,
    });
    throw new DatabaseError("Failed to update category");
  }
};

export const deleteCategory = async (id: number): Promise<CategoryRow> => {
  try {
    const [deletedCategory] = await db
      .update(categories)
      .set({ status: "inactive" })
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      throw new NotFoundError("Category not found");
    }

    return toCategoryRow(deletedCategory);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in deleteCategory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deleteCategory",
      categoryId: id,
    });
    throw new DatabaseError("Failed to delete category");
  }
};

export const getCategoryById = async (id: number): Promise<CategoryRow> => {
  try {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category || category.status !== "active") {
      throw new NotFoundError("Category not found");
    }

    return toCategoryRow(category);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getCategoryById:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getCategoryById",
      categoryId: id,
    });
    throw new DatabaseError("Failed to fetch category");
  }
};

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export const getAllCategories = async () => {
  try {
    return await db.query.categories.findMany({
      orderBy: [desc(categories.id)],
    });
  } catch (error) {
    console.error("Database error in getAllCategories:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllCategories",
    });
    throw new DatabaseError("Failed to fetch categories");
  }
};

export const createCategory = async (data: {
  displayName: string;
  imagePath?: string;
}) => {
  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        displayName: data.displayName,
        imagePath: data.imagePath,
      })
      .returning();

    return newCategory;
  } catch (error) {
    console.error("Database error in createCategory:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createCategory",
      data: { displayName: data.displayName, hasImagePath: !!data.imagePath },
    });
    throw new DatabaseError("Failed to create category");
  }
};

export const updateCategory = async (
  id: number,
  data: {
    displayName?: string;
    imagePath?: string;
    status?: "active" | "deleted";
  },
) => {
  try {
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new NotFoundError("Category not found");
    }
    return updatedCategory;
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

export const deleteCategory = async (id: number) => {
  try {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      throw new NotFoundError("Category not found");
    }
    return deletedCategory;
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

export const getCategoryById = async (id: number) => {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
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

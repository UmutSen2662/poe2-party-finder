import { sql } from "@/db/sql";
import { sqlFile } from "@/db/sql-files";
import type { Category } from "@/db/types";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export type CategoryStatus = "Active" | "Inactive";
export type CategoryRow = Omit<Category, "status"> & { status: CategoryStatus };

export const getAllCategories = async (): Promise<CategoryRow[]> => {
  try {
    return await sql.file<CategoryRow[]>(sqlFile("categories", "get-all.sql"));
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
    const [newCategory] = await sql.file<CategoryRow[]>(
      sqlFile("categories", "create.sql"),
      [data.name, data.image ?? null, data.status ?? "Active"],
    );

    return newCategory;
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
    const [updatedCategory] = await sql.file<CategoryRow[]>(
      sqlFile("categories", "update.sql"),
      [id, data.name ?? null, data.image ?? null, data.status ?? null],
    );

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

export const deleteCategory = async (id: number): Promise<CategoryRow> => {
  try {
    const [deletedCategory] = await sql.file<CategoryRow[]>(
      sqlFile("categories", "deactivate.sql"),
      [id],
    );

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

export const getCategoryById = async (id: number): Promise<CategoryRow> => {
  try {
    const [category] = await sql.file<CategoryRow[]>(
      sqlFile("categories", "get-by-id.sql"),
      [id],
    );

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

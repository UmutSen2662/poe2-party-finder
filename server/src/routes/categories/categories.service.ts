import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const getAllCategories = async () => {
  return await db.query.categories.findMany({
    orderBy: [desc(categories.id)],
  });
};

export const createCategory = async (data: {
  displayName: string;
  imagePath?: string;
}) => {
  const [newCategory] = await db
    .insert(categories)
    .values({
      displayName: data.displayName,
      imagePath: data.imagePath,
    })
    .returning();
  return newCategory;
};

export const updateCategory = async (
  id: number,
  data: {
    displayName?: string;
    imagePath?: string;
    status?: "active" | "deleted";
  },
) => {
  const [updatedCategory] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  if (!updatedCategory) {
    throw new Error("Category not found");
  }
  return updatedCategory;
};

export const deleteCategory = async (id: number) => {
  const [deletedCategory] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deletedCategory) {
    throw new Error("Category not found");
  }
  return deletedCategory;
};

export const getCategoryById = async (id: number) => {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });

  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

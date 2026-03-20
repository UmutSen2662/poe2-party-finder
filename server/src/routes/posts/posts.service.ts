import { desc } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { DatabaseError } from "@/lib/errors";

export const getAllPosts = async () => {
  try {
    return await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
    });
  } catch (error) {
    console.error("Database error in getAllPosts:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllPosts",
    });
    throw new DatabaseError("Failed to fetch posts");
  }
};

export const createPost = async (data: { title: string; content: string }) => {
  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        title: data.title,
        content: data.content,
      })
      .returning();

    return newPost;
  } catch (error) {
    console.error("Database error in createPost:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createPost",
      data: { title: data.title, hasContent: !!data.content },
    });
    throw new DatabaseError("Failed to create post");
  }
};

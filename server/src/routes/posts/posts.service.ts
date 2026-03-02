import { desc } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema";

export const getAllPosts = async () => {
  return await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
  });
};

export const createPost = async (data: { title: string; content: string }) => {
  const [newPost] = await db
    .insert(posts)
    .values({
      title: data.title,
      content: data.content,
    })
    .returning();
  return newPost;
};

import { desc } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { posts } from "../../db/schema";

export const postListRoutes = new Elysia()
  .get("/posts", async () => {
    return await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
    });
  })
  .post(
    "/posts",
    async ({ body }) => {
      const [newPost] = await db
        .insert(posts)
        .values({
          title: body.title,
          content: body.content,
        })
        .returning();
      return newPost;
    },
    {
      body: t.Object({
        title: t.String(),
        content: t.String(),
      }),
    },
  );

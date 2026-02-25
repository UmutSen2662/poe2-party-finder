import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { desc } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "./db";
import { posts } from "./db/schema";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "PoE 2 Party Finder API",
          version: "1.0.0",
        },
      },
    }),
  )
  .get("/", () => "Hello Elysia")
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
  )
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

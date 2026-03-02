import { Elysia, t } from "elysia";
import { createPost, getAllPosts } from "./posts.service";

export const postsRoutes = new Elysia({ prefix: "/posts" })
  .get("/", () => getAllPosts())
  .post("/", ({ body }) => createPost(body), {
    body: t.Object({
      title: t.String(),
      content: t.String(),
    }),
  });

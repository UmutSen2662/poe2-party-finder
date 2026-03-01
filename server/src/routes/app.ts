import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { postsRoutes } from "./posts/posts";

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
  .use(postsRoutes)
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

import { Elysia } from "elysia";
import { postListRoutes } from "./posts.handler";

export const postsRoutes = new Elysia().use(postListRoutes);

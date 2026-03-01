import { Elysia } from "elysia";
import { postIdRoutes } from "./[id]";
import { postListRoutes } from "./post-list";

export const postsRoutes = new Elysia().use(postListRoutes).use(postIdRoutes);

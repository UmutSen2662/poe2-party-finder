import { Elysia } from "elysia";
import { categoriesRoutes } from "./categories";
import { postsRoutes } from "./posts";

export const api = new Elysia().use(postsRoutes).use(categoriesRoutes);

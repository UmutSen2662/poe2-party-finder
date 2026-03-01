import { Elysia } from "elysia";
import { postsRoutes } from "./posts";

export const api = new Elysia().use(postsRoutes);

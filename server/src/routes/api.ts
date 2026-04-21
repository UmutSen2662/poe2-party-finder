import { Elysia } from "elysia";
import { categoriesRoutes } from "./categories";

export const api = new Elysia().use(categoriesRoutes);

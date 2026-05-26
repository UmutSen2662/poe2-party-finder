import { Elysia } from "elysia";
import { adminsRoutes } from "./admins";
import { applicationsRoutes } from "./applications";
import { badgesRoutes } from "./badges";
import { categoriesRoutes } from "./categories";
import { currenciesRoutes } from "./currencies";
import { leaguesRoutes } from "./leagues";
import { lobbyRoutes } from "./lobby";
import { partiesRoutes } from "./parties";
import { playersRoutes } from "./players";
import { ratingsRoutes } from "./ratings";

export const api = new Elysia()
  .use(categoriesRoutes)
  .use(leaguesRoutes)
  .use(currenciesRoutes)
  .use(playersRoutes)
  .use(partiesRoutes)
  .use(applicationsRoutes)
  .use(ratingsRoutes)
  .use(badgesRoutes)
  .use(adminsRoutes)
  .use(lobbyRoutes);

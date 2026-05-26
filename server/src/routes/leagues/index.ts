import { Elysia, t } from "elysia";
import {
  createLeague,
  deleteLeague,
  getAllLeagues,
  updateLeague,
} from "./leagues.service";

const StatusSchema = t.Union([t.Literal("Active"), t.Literal("Inactive")]);

const LeagueSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  status: StatusSchema,
});

export const leaguesRoutes = new Elysia({ prefix: "/leagues" })
  .get("/", ({ query }) => getAllLeagues(query.activeOnly ?? false), {
    query: t.Object({
      activeOnly: t.Optional(t.Boolean()),
    }),
    response: t.Array(LeagueSchema),
  })
  .post("/", ({ body }) => createLeague(body), {
    body: t.Object({
      name: t.String(),
      status: t.Optional(StatusSchema),
    }),
    response: LeagueSchema,
  })
  .put("/:id", ({ params, body }) => updateLeague(params.id, body), {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      name: t.Optional(t.String()),
      status: t.Optional(StatusSchema),
    }),
    response: LeagueSchema,
  })
  .delete("/:id", ({ params }) => deleteLeague(params.id), {
    params: t.Object({ id: t.Number() }),
    response: LeagueSchema,
  });

import { Elysia, t } from "elysia";
import {
  addPlayerTemplate,
  createPlayer,
  deletePlayerTemplate,
  getAllPlayers,
  getPlayerBadges,
  getPlayerById,
  getPlayerHistory,
  pinPlayerBadge,
  updatePlayer,
  updatePlayerTemplate,
} from "./players.service";

const ServiceTemplateSchema = t.Object({
  name: t.String(),
  text: t.String(),
  title: t.Optional(t.String()),
  description: t.Optional(t.String()),
  capacity: t.Optional(t.Number()),
  cost: t.Optional(t.Number()),
  leagueId: t.Optional(t.Number()),
  categoryId: t.Optional(t.Number()),
  currencyId: t.Optional(t.Number()),
});

const PlayerSchema = t.Object({
  id: t.Number(),
  ign: t.String(),
  oauth2: t.Union([t.String(), t.Null()]),
  templates: t.Array(ServiceTemplateSchema),
  hostRating: t.Number(),
  customerRating: t.Number(),
  hostThumbsUp: t.Number(),
  hostThumbsDown: t.Number(),
  customerThumbsUp: t.Number(),
  customerThumbsDown: t.Number(),
});

export const playersRoutes = new Elysia({ prefix: "/players" })
  .get("/", () => getAllPlayers(), {
    response: t.Array(PlayerSchema),
  })
  .post("/", ({ body }) => createPlayer(body), {
    body: t.Object({
      ign: t.String(),
      oauth2: t.String(),
      templates: t.Optional(t.Array(ServiceTemplateSchema)),
    }),
    response: PlayerSchema,
  })
  .get("/:id", ({ params }) => getPlayerById(params.id), {
    params: t.Object({ id: t.Number() }),
    response: PlayerSchema,
  })
  .put("/:id", ({ params, body }) => updatePlayer(params.id, body), {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      ign: t.Optional(t.String()),
      oauth2: t.Optional(t.String()),
      templates: t.Optional(t.Array(ServiceTemplateSchema)),
    }),
    response: PlayerSchema,
  })
  .post(
    "/:id/templates",
    ({ params, body }) => addPlayerTemplate(params.id, body),
    {
      params: t.Object({ id: t.Number() }),
      body: ServiceTemplateSchema,
      response: PlayerSchema,
    },
  )
  .put(
    "/:id/templates/:index",
    ({ params, body }) => updatePlayerTemplate(params.id, params.index, body),
    {
      params: t.Object({ id: t.Number(), index: t.Number() }),
      body: ServiceTemplateSchema,
      response: PlayerSchema,
    },
  )
  .delete(
    "/:id/templates/:index",
    ({ params }) => deletePlayerTemplate(params.id, params.index),
    {
      params: t.Object({ id: t.Number(), index: t.Number() }),
      response: PlayerSchema,
    },
  )
  .get("/:id/badges", ({ params }) => getPlayerBadges(params.id), {
    params: t.Object({ id: t.Number() }),
  })
  .put(
    "/:id/badges/:badgeId/pin",
    ({ params }) => pinPlayerBadge(params.id, params.badgeId),
    {
      params: t.Object({ id: t.Number(), badgeId: t.Number() }),
    },
  )
  .get("/:id/history", ({ params }) => getPlayerHistory(params.id), {
    params: t.Object({ id: t.Number() }),
  });

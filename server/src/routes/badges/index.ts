import { Elysia, t } from "elysia";
import {
  awardBadge,
  createBadge,
  deleteBadge,
  getAllBadges,
  getBadgesByCategory,
  getPlayerBadges,
  updateEquippedBadges,
} from "./badges.service";

const BadgeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  icon: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  rarity: t.Union([
    t.Literal("common"),
    t.Literal("uncommon"),
    t.Literal("rare"),
    t.Literal("legendary"),
  ]),
  condition: t.Record(t.String(), t.Unknown()),
});

const PlayerBadgeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  icon: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  rarity: t.Union([
    t.Literal("common"),
    t.Literal("uncommon"),
    t.Literal("rare"),
    t.Literal("legendary"),
  ]),
  condition: t.Record(t.String(), t.Unknown()),
  earned: t.Boolean(),
  equipped: t.Boolean(),
});

export const badgesRoutes = new Elysia({ prefix: "/badges" })
  .get("/", () => getAllBadges(), {
    response: t.Array(BadgeSchema),
  })
  .get(
    "/category/:categoryId",
    ({ params }) => getBadgesByCategory(params.categoryId),
    {
      params: t.Object({ categoryId: t.Number() }),
      response: t.Array(BadgeSchema),
    },
  )
  .post("/", ({ body }) => createBadge(body), {
    body: t.Object({
      name: t.String(),
      icon: t.Optional(t.String()),
      description: t.Optional(t.String()),
      condition: t.Record(t.String(), t.Unknown()),
      categoryIds: t.Optional(t.Array(t.Number())),
    }),
    response: BadgeSchema,
  })
  .post("/award", ({ body }) => awardBadge(body), {
    body: t.Object({
      playerId: t.Number(),
      badgeId: t.Number(),
      pinned: t.Optional(t.Boolean()),
    }),
  })
  .get("/player/:playerId", ({ params }) => getPlayerBadges(params.playerId), {
    params: t.Object({ playerId: t.Number() }),
    response: t.Array(PlayerBadgeSchema),
  })
  .put(
    "/player/:playerId/equipped",
    ({ params, body }) => updateEquippedBadges(params.playerId, body.badgeIds),
    {
      params: t.Object({ playerId: t.Number() }),
      body: t.Object({
        badgeIds: t.Array(t.Number()),
      }),
      response: t.Array(PlayerBadgeSchema),
    },
  )
  .delete("/:id", ({ params }) => deleteBadge(params.id), {
    params: t.Object({ id: t.Number() }),
    response: BadgeSchema,
  });

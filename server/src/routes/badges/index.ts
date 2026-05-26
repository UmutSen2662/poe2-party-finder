import { Elysia, t } from "elysia";
import {
  awardBadge,
  createBadge,
  deleteBadge,
  getAllBadges,
  getBadgesByCategory,
} from "./badges.service";

const BadgeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  icon: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  condition: t.Record(t.String(), t.Unknown()),
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
  .delete("/:id", ({ params }) => deleteBadge(params.id), {
    params: t.Object({ id: t.Number() }),
    response: BadgeSchema,
  });

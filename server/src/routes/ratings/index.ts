import { Elysia, t } from "elysia";
import {
  createRating,
  getPartyRatings,
  getUnvotedPartiesForPlayer,
} from "./ratings.service";

const RatingSchema = t.Object({
  id: t.Number(),
  value: t.Union([t.Literal(1), t.Literal(-1)]),
  timestamp: t.Date(),
  giverId: t.Nullable(t.Number()),
  receiverId: t.Nullable(t.Number()),
  partyId: t.Nullable(t.Number()),
  direction: t.Union([
    t.Literal("Host-to-Customer"),
    t.Literal("Customer-to-Host"),
  ]),
});

export const ratingsRoutes = new Elysia({ prefix: "/ratings" })
  .post("/", ({ body }) => createRating(body), {
    body: t.Object({
      value: t.Union([t.Literal(1), t.Literal(-1)]),
      giverId: t.Number(),
      receiverId: t.Number(),
      partyId: t.Number(),
    }),
    response: RatingSchema,
  })
  .get("/party/:partyId", ({ params }) => getPartyRatings(params.partyId), {
    params: t.Object({ partyId: t.Number() }),
    response: t.Array(RatingSchema),
  })
  .get(
    "/unvoted/:playerId",
    ({ params }) => getUnvotedPartiesForPlayer(params.playerId),
    {
      params: t.Object({ playerId: t.Number() }),
      response: t.Array(
        t.Object({
          partyId: t.Number(),
          partyTitle: t.String(),
          role: t.Union([t.Literal("host"), t.Literal("customer")]),
          targets: t.Array(
            t.Object({
              id: t.Number(),
              ign: t.String(),
            }),
          ),
        }),
      ),
    },
  );

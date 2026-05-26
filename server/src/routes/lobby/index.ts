import { Elysia, t } from "elysia";
import {
  addPlayerTemplate,
  deletePlayerTemplate,
  getLobbyState,
  getPlayerTemplates,
} from "./lobby.service";

const LobbyStateSchema = t.Union([
  t.Object({
    kind: t.Literal("empty"),
  }),
  t.Object({
    kind: t.Literal("customer"),
    application: t.Object({
      playerId: t.Number(),
      partyId: t.Number(),
      status: t.Union([
        t.Literal("Pending"),
        t.Literal("Accepted"),
        t.Literal("Rejected"),
        t.Literal("Kicked"),
      ]),
      appliedAt: t.Date(),
      party: t.Object({
        id: t.Number(),
        title: t.String(),
        description: t.Nullable(t.String()),
        capacity: t.Number(),
        cost: t.Number(),
        status: t.Union([
          t.Literal("Gathering"),
          t.Literal("Started"),
          t.Literal("Ended"),
        ]),
        createdAt: t.Date(),
        host: t.Nullable(
          t.Object({
            id: t.Number(),
            ign: t.String(),
            hostRating: t.Number(),
          }),
        ),
        league: t.Object({
          id: t.Number(),
          name: t.String(),
        }),
        category: t.Object({
          id: t.Number(),
          displayName: t.String(),
          imagePath: t.Nullable(t.String()),
        }),
        currency: t.Object({
          id: t.Number(),
          name: t.String(),
          icon: t.Nullable(t.String()),
        }),
      }),
    }),
  }),
  t.Object({
    kind: t.Literal("host"),
    party: t.Object({
      id: t.Number(),
      title: t.String(),
      description: t.Nullable(t.String()),
      capacity: t.Number(),
      cost: t.Number(),
      status: t.Union([
        t.Literal("Gathering"),
        t.Literal("Started"),
        t.Literal("Ended"),
      ]),
      createdAt: t.Date(),
      host: t.Nullable(
        t.Object({
          id: t.Number(),
          ign: t.String(),
          hostRating: t.Number(),
        }),
      ),
      league: t.Object({
        id: t.Number(),
        name: t.String(),
      }),
      category: t.Object({
        id: t.Number(),
        displayName: t.String(),
        imagePath: t.Nullable(t.String()),
      }),
      currency: t.Object({
        id: t.Number(),
        name: t.String(),
        icon: t.Nullable(t.String()),
      }),
    }),
  }),
]);

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

export const lobbyRoutes = new Elysia({ prefix: "/lobby" })
  .get("/state", ({ query }) => getLobbyState(query.playerId), {
    query: t.Object({
      playerId: t.Number(),
    }),
    response: LobbyStateSchema,
  })
  .get("/templates", ({ query }) => getPlayerTemplates(query.playerId), {
    query: t.Object({
      playerId: t.Number(),
    }),
    response: t.Array(ServiceTemplateSchema),
  })
  .post(
    "/templates",
    ({ query, body }) => addPlayerTemplate(query.playerId, body),
    {
      query: t.Object({
        playerId: t.Number(),
      }),
      body: ServiceTemplateSchema,
      response: t.Array(ServiceTemplateSchema),
    },
  )
  .delete(
    "/templates/:index",
    ({ params, query }) =>
      deletePlayerTemplate(query.playerId, Number(params.index)),
    {
      params: t.Object({
        index: t.String(),
      }),
      query: t.Object({
        playerId: t.Number(),
      }),
      response: t.Array(ServiceTemplateSchema),
    },
  );

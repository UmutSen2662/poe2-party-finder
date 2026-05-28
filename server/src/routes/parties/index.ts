import { Elysia, sse, t } from "elysia";
import { subscribeToLiveApplications } from "../../lib/application-live-events";
import { subscribeToLiveParties } from "../../lib/party-live-events";
import {
  cancelParty,
  createParty,
  getActivePartyForHost,
  getPartyApplications,
  getPartyRatingTargets,
  getSearchPartyById,
  getWhisperMessage,
  searchParties,
  updatePartyStatus,
} from "./parties.service";

const PartyStatusSchema = t.Union([
  t.Literal("Gathering"),
  t.Literal("Started"),
  t.Literal("Ended"),
]);

const PartySchema = t.Object({
  id: t.Number(),
  title: t.String(),
  description: t.Nullable(t.String()),
  createdAt: t.Date(),
  capacity: t.Number(),
  status: PartyStatusSchema,
  cost: t.Number(),
  hostId: t.Nullable(t.Number()),
  leagueId: t.Number(),
  categoryId: t.Number(),
  currencyId: t.Number(),
});

export const partiesRoutes = new Elysia({ prefix: "/parties" })
  .get("/", ({ query }) => searchParties(query), {
    query: t.Object({
      leagueId: t.Optional(t.Number()),
      categoryId: t.Optional(t.Number()),
      currencyId: t.Optional(t.Number()),
      minHostRating: t.Optional(t.Number()),
      includeUnrated: t.Optional(t.Boolean()),
      minPrice: t.Optional(t.Number()),
      maxPrice: t.Optional(t.Number()),
      q: t.Optional(t.String()),
      excludeHostId: t.Optional(t.Number()),
    }),
  })
  .get(
    "/live",
    async function* ({ query, request }) {
      yield sse({
        event: "connected",
        data: { live: true, timestamp: new Date().toISOString() },
      });

      for await (const event of subscribeToLiveParties(query, request.signal)) {
        yield sse({
          event: event.type,
          data: event.data,
        });
      }
    },
    {
      query: t.Object({
        leagueId: t.Optional(t.Number()),
        categoryId: t.Optional(t.Number()),
        currencyId: t.Optional(t.Number()),
        minHostRating: t.Optional(t.Number()),
        includeUnrated: t.Optional(t.Boolean()),
        minPrice: t.Optional(t.Number()),
        maxPrice: t.Optional(t.Number()),
        q: t.Optional(t.String()),
      }),
    },
  )
  .post("/", ({ body }) => createParty(body), {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
      capacity: t.Number(),
      cost: t.Number(),
      hostId: t.Number(),
      leagueId: t.Number(),
      categoryId: t.Number(),
      currencyId: t.Number(),
    }),
    response: PartySchema,
  })
  .get("/:id", ({ params }) => getSearchPartyById(params.id), {
    params: t.Object({ id: t.Number() }),
  })
  .put(
    "/:id/status",
    ({ params, body }) =>
      updatePartyStatus(params.id, body.status, body.hostId),
    {
      params: t.Object({ id: t.Number() }),
      body: t.Object({ status: PartyStatusSchema, hostId: t.Number() }),
      response: PartySchema,
    },
  )
  .delete("/:id", ({ params, query }) => cancelParty(params.id, query.hostId), {
    params: t.Object({ id: t.Number() }),
    query: t.Object({ hostId: t.Number() }),
    response: PartySchema,
  })
  .get(
    "/:id/applications",
    ({ params, query }) =>
      getPartyApplications(params.id, query.hostId, query.pendingOnly ?? false),
    {
      params: t.Object({ id: t.Number() }),
      query: t.Object({
        hostId: t.Number(),
        pendingOnly: t.Optional(t.Boolean()),
      }),
    },
  )
  .get(
    "/:id/applications/live",
    async function* ({ params, request }) {
      yield sse({
        event: "connected",
        data: { live: true, timestamp: new Date().toISOString() },
      });

      for await (const event of subscribeToLiveApplications(
        params.id,
        request.signal,
      )) {
        yield sse({
          event: event.type,
          data: event.data,
        });
      }
    },
    {
      params: t.Object({ id: t.Number() }),
    },
  )
  .get(
    "/:id/rating-targets",
    ({ params, query }) => getPartyRatingTargets(params.id, query.hostId),
    {
      params: t.Object({ id: t.Number() }),
      query: t.Object({ hostId: t.Number() }),
    },
  )
  .get(
    "/:id/whisper",
    ({ params, query }) => getWhisperMessage(params.id, query.customerId),
    {
      params: t.Object({ id: t.Number() }),
      query: t.Object({ customerId: t.Optional(t.Number()) }),
      response: t.Object({ whisperMessage: t.String() }),
    },
  )
  .get(
    "/active/:hostId",
    ({ params }) => getActivePartyForHost(params.hostId),
    {
      params: t.Object({ hostId: t.Number() }),
      response: t.Union([PartySchema, t.Null()]),
    },
  );

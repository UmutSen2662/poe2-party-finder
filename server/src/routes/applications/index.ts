import { Elysia, t } from "elysia";
import {
  createApplication,
  deleteApplication,
  getPlayerApplicationStatus,
  updateApplicationStatus,
} from "./applications.service";

const ApplicationStatusSchema = t.Union([
  t.Literal("Pending"),
  t.Literal("Accepted"),
  t.Literal("Rejected"),
  t.Literal("Kicked"),
]);

const ApplicationSchema = t.Object({
  playerId: t.Number(),
  partyId: t.Number(),
  status: ApplicationStatusSchema,
  appliedAt: t.Date(),
});

export const applicationsRoutes = new Elysia({ prefix: "/applications" })
  .post("/", ({ body }) => createApplication(body), {
    body: t.Object({
      playerId: t.Number(),
      partyId: t.Number(),
    }),
    response: ApplicationSchema,
  })
  .get(
    "/:partyId/:playerId",
    ({ params }) => getPlayerApplicationStatus(params.playerId, params.partyId),
    {
      params: t.Object({ partyId: t.Number(), playerId: t.Number() }),
      response: ApplicationSchema,
    },
  )
  .put(
    "/:partyId/:playerId/status",
    ({ params, body }) =>
      updateApplicationStatus(
        params.playerId,
        params.partyId,
        body.status,
        body.hostId,
      ),
    {
      params: t.Object({ partyId: t.Number(), playerId: t.Number() }),
      body: t.Object({ status: ApplicationStatusSchema, hostId: t.Number() }),
      response: ApplicationSchema,
    },
  )
  .delete(
    "/:partyId/:playerId",
    ({ params, query }) =>
      deleteApplication(
        params.playerId,
        params.partyId,
        query.requesterPlayerId,
      ),
    {
      params: t.Object({ partyId: t.Number(), playerId: t.Number() }),
      query: t.Object({ requesterPlayerId: t.Number() }),
      response: ApplicationSchema,
    },
  );

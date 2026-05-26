import { Elysia, t } from "elysia";
import {
  createAdmin,
  deleteAdmin,
  getAllAdmins,
  updateAdmin,
} from "./admins.service";

const AdminSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  password: t.String(),
  permissions: t.String(),
});

export const adminsRoutes = new Elysia({ prefix: "/admins" })
  .get("/", () => getAllAdmins(), {
    response: t.Array(AdminSchema),
  })
  .post("/", ({ body }) => createAdmin(body), {
    body: t.Object({
      email: t.String(),
      password: t.String(),
      permissions: t.String(),
    }),
    response: AdminSchema,
  })
  .put("/:id", ({ params, body }) => updateAdmin(params.id, body), {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      email: t.Optional(t.String()),
      password: t.Optional(t.String()),
      permissions: t.Optional(t.String()),
    }),
    response: AdminSchema,
  })
  .delete("/:id", ({ params }) => deleteAdmin(params.id), {
    params: t.Object({ id: t.Number() }),
    response: AdminSchema,
  });

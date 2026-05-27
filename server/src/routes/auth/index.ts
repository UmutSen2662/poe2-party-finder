import { Elysia, t } from "elysia";
import { getUserById, loginUser } from "./auth.service";

const AuthUserSchema = t.Object({
  id: t.Number(),
  ign: t.String(),
  email: t.Union([t.String(), t.Null()]),
  hostRating: t.Number(),
  customerRating: t.Number(),
  hostThumbsUp: t.Number(),
  hostThumbsDown: t.Number(),
  customerThumbsUp: t.Number(),
  customerThumbsDown: t.Number(),
});

const LoginResultSchema = t.Object({
  user: AuthUserSchema,
  token: t.String(),
});

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/login",
    async ({ body }) => {
      return loginUser(body.email, body.password);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: LoginResultSchema,
    },
  )
  .get(
    "/me",
    async ({ request }) => {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
      }

      const token = authHeader.substring(7);
      const { verifyToken } = await import("./auth.service");
      const { userId } = verifyToken(token);

      return getUserById(userId);
    },
    {
      response: AuthUserSchema,
    },
  );

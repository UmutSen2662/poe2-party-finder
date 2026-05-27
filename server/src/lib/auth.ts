import { Elysia } from "elysia";
import { verifyToken, getUserById } from "../routes/auth/auth.service";
import { ValidationError } from "./errors";

export const authMiddleware = new Elysia({ name: "auth" }).derive(
  async ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ValidationError("Unauthorized: No token provided");
    }

    const token = authHeader.substring(7);

    try {
      const { userId } = verifyToken(token);
      const user = await getUserById(userId);

      return { user };
    } catch {
      throw new ValidationError("Unauthorized: Invalid token");
    }
  },
);

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import { players } from "../../db/schema";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: number;
  ign: string;
  email: string | null;
  hostRating: number;
  customerRating: number;
  hostThumbsUp: number;
  hostThumbsDown: number;
  customerThumbsUp: number;
  customerThumbsDown: number;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: number } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    throw new ValidationError("Invalid or expired token");
  }
};

export const getUserById = async (id: number): Promise<AuthUser> => {
  try {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    if (!player) {
      throw new NotFoundError("User not found");
    }

    return {
      id: player.id,
      ign: player.ign,
      email: player.email,
      hostRating: player.hostRating,
      customerRating: player.customerRating,
      hostThumbsUp: player.hostThumbsUp,
      hostThumbsDown: player.hostThumbsDown,
      customerThumbsUp: player.customerThumbsUp,
      customerThumbsDown: player.customerThumbsDown,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getUserById:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getUserById",
      context: { userId: id },
    });
    throw new DatabaseError("Failed to fetch user");
  }
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  try {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.email, email))
      .limit(1);

    if (!player) {
      throw new ValidationError("Invalid email or password");
    }

    if (!player.password) {
      throw new ValidationError("User does not have a password set");
    }

    const isValidPassword = await bcrypt.compare(password, player.password);

    if (!isValidPassword) {
      throw new ValidationError("Invalid email or password");
    }

    const user: AuthUser = {
      id: player.id,
      ign: player.ign,
      email: player.email,
      hostRating: player.hostRating,
      customerRating: player.customerRating,
      hostThumbsUp: player.hostThumbsUp,
      hostThumbsDown: player.hostThumbsDown,
      customerThumbsUp: player.customerThumbsUp,
      customerThumbsDown: player.customerThumbsDown,
    };

    const token = generateToken(player.id);

    return { user, token };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in loginUser:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "loginUser",
      context: { email },
    });
    throw new DatabaseError("Failed to login");
  }
};

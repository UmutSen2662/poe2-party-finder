import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import {
  AppError,
  createErrorResponse,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "./lib/errors";
import { api } from "./routes/api";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "PoE 2 Party Finder API",
          version: "1.0.0",
        },
      },
    }),
  )
  .get("/", () => "Hello Elysia")
  .use(api)
  .onError(({ code, error, set }) => {
    // Handle Elysia validation errors
    if (code === "VALIDATION") {
      set.status = 400;
      return createErrorResponse(new ValidationError("Invalid request data"));
    }

    // Handle Elysia not found errors
    if (code === "NOT_FOUND") {
      set.status = 404;
      return createErrorResponse(new NotFoundError("Endpoint not found"));
    }

    // Handle our custom AppError instances
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return createErrorResponse(error);
    }

    // Handle generic errors
    console.error("Unhandled error:", error);
    set.status = 500;
    return createErrorResponse(
      new InternalServerError("Internal server error"),
    );
  })
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

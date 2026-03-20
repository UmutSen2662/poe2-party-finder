import { t } from "elysia";

// Error response schema
export const ErrorResponseSchema = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
    timestamp: t.String(),
  }),
});

// Custom error classes
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super("VALIDATION_ERROR", message, 400);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super("DATABASE_ERROR", message, 500);
    this.name = "DatabaseError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super("INTERNAL_ERROR", message, 500);
    this.name = "InternalServerError";
  }
}

// Helper function to create error response
export const createErrorResponse = (error: AppError) => ({
  error: {
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString(),
  },
});

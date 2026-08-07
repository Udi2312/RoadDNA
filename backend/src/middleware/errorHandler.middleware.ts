// ─── Global error handler — must be the LAST middleware in app.ts ───

import { ErrorRequestHandler } from "express";
import { z } from "zod";
import { logger } from "../config/logger";
import { sendError } from "../shared/utils/apiResponse";
import { AppError } from "../shared/utils/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. Zod validation errors → 400
  if (err instanceof z.ZodError) {
    sendError(res, "Validation failed", 400, err.issues);
    return;
  }

  // 2. Our own operational errors → dynamic status code
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // 3. Everything else → 500 (log the full stack for debugging)
  logger.error({ err, stack: err.stack }, "Unhandled error");
  sendError(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error",
    500
  );
};

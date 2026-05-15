import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error";

  response.status(statusCode).json({
    message,
    details: error instanceof HttpError ? error.details : undefined,
    stack: env.nodeEnv === "development" && error instanceof Error ? error.stack : undefined
  });
};

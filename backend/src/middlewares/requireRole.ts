import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../models/auth.js";
import { HttpError } from "../utils/httpError.js";

export const requireRole =
  (...allowedRoles: string[]): RequestHandler =>
  (request, _response, next) => {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      next(new HttpError(401, "Authenticated user is required"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new HttpError(403, "No tienes permisos para realizar esta accion"));
      return;
    }

    next();
  };

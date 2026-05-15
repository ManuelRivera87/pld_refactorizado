import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import type { AuthenticatedRequest, JwtPayload } from "../models/auth.js";
import { findUserById } from "../services/userService.js";
import { HttpError } from "../utils/httpError.js";

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.header("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authorization token is required");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new HttpError(401, "Invalid session");
    }

    (request as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, "Invalid or expired token"));
  }
};

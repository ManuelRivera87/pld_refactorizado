import type { Request } from "express";
import type { SafeUser } from "./user.js";

export type LoginInput = {
  email?: string;
  password?: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  user?: SafeUser;
};

import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import type { LoginInput } from "../models/auth.js";
import type { SafeUser } from "../models/user.js";
import { HttpError } from "../utils/httpError.js";
import { isAutocomEmail, normalizeEmail } from "../utils/email.js";
import { findUserByEmail } from "./userService.js";

export type LoginResult = {
  token: string;
  user: SafeUser;
};

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const email = normalizeEmail(input.email);

  if (!email || !input.password) {
    throw new HttpError(400, "Email and password are required");
  }

  if (!isAutocomEmail(email)) {
    throw new HttpError(400, "Only @autocom.mx email addresses are allowed");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid credentials");
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(
    {
      email: safeUser.email,
      role: safeUser.role
    },
    jwtConfig.secret,
    {
      subject: safeUser.id,
      expiresIn: jwtConfig.expiresIn
    } as SignOptions
  );

  return {
    token,
    user: safeUser
  };
};

import type { Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.js";
import { loginUser } from "../services/authService.js";

export const loginController = async (request: AuthenticatedRequest, response: Response) => {
  const result = await loginUser(request.body);

  response.json(result);
};

export const meController = (request: AuthenticatedRequest, response: Response) => {
  response.json({
    user: request.user
  });
};

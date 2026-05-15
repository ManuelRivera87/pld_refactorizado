import { http } from "./http";
import type { AuthSession, LoginCredentials } from "../auth/types";

export const loginRequest = async (credentials: LoginCredentials) => {
  const { data } = await http.post<AuthSession>("/auth/login", credentials);

  return data;
};

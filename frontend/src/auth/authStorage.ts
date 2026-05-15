import type { AuthSession } from "./types";

const tokenKey = "pld.auth.token";
const userKey = "pld.auth.user";

export const getStoredAuth = (): AuthSession | null => {
  const token = localStorage.getItem(tokenKey);
  const user = localStorage.getItem(userKey);

  if (!token || !user) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(user)
    };
  } catch {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    return null;
  }
};

export const setStoredAuth = (session: AuthSession) => {
  localStorage.setItem(tokenKey, session.token);
  localStorage.setItem(userKey, JSON.stringify(session.user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

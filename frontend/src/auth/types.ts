export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

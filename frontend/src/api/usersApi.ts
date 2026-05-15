import { http } from "./http";

export type UserItem = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type SaveUserPayload = {
  email: string;
  password?: string;
  role: string;
};

export const listUsersRequest = async () => {
  const { data } = await http.get<{ users: UserItem[] }>("/users");

  return data.users;
};

export const createUserRequest = async (payload: SaveUserPayload) => {
  const { data } = await http.post<{ user: UserItem }>("/users", payload);

  return data.user;
};

export const updateUserRequest = async (id: string, payload: SaveUserPayload) => {
  const { data } = await http.put<{ user: UserItem }>(`/users/${id}`, payload);

  return data.user;
};

export const deleteUserRequest = async (id: string) => {
  await http.delete(`/users/${id}`);
};

import type { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser
} from "../services/userService.js";

export const listUsersController = async (_request: Request, response: Response) => {
  const users = await listUsers();

  response.json({ users });
};

export const getUserController = async (request: Request, response: Response) => {
  const user = await getUserById(request.params.id);

  response.json({ user });
};

export const createUserController = async (request: Request, response: Response) => {
  const user = await createUser(request.body);

  response.status(201).json({ user });
};

export const updateUserController = async (request: Request, response: Response) => {
  const user = await updateUser(request.params.id, request.body);

  response.json({ user });
};

export const deleteUserController = async (request: Request, response: Response) => {
  await deleteUser(request.params.id);

  response.status(204).send();
};

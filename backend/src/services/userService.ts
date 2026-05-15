import bcrypt from "bcrypt";
import { database } from "../config/database.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserResponse
} from "../models/user.js";
import { isAutocomEmail, normalizeEmail } from "../utils/email.js";
import { HttpError } from "../utils/httpError.js";

const userFields = `
  id,
  email,
  password_hash,
  role,
  created_at,
  updated_at
`;

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await database.query<User>(
    `SELECT ${userFields} FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await database.query<User>(
    `SELECT ${userFields} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ?? null;
};

const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at
});

const normalizeRole = (role: unknown) => {
  if (typeof role !== "string" || !role.trim()) {
    return "user";
  }

  return role.trim().toLowerCase();
};

export const listUsers = async (): Promise<UserResponse[]> => {
  const result = await database.query<User>(
    `SELECT ${userFields} FROM users ORDER BY created_at DESC`
  );

  return result.rows.map(toUserResponse);
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  const user = await findUserById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return toUserResponse(user);
};

export const createUser = async (input: CreateUserInput): Promise<UserResponse> => {
  const email = normalizeEmail(input.email);

  if (!email || !input.password) {
    throw new HttpError(400, "Email and password are required");
  }

  if (!isAutocomEmail(email)) {
    throw new HttpError(400, "Only @autocom.mx email addresses are allowed");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const role = normalizeRole(input.role);

  try {
    const result = await database.query<User>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING ${userFields}`,
      [email, passwordHash, role]
    );

    return toUserResponse(result.rows[0]);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      throw new HttpError(409, "User email already exists");
    }

    throw error;
  }
};

export const updateUser = async (
  id: string,
  input: UpdateUserInput
): Promise<UserResponse> => {
  const currentUser = await findUserById(id);

  if (!currentUser) {
    throw new HttpError(404, "User not found");
  }

  const email = input.email === undefined ? currentUser.email : normalizeEmail(input.email);

  if (!email) {
    throw new HttpError(400, "Email is required");
  }

  if (!isAutocomEmail(email)) {
    throw new HttpError(400, "Only @autocom.mx email addresses are allowed");
  }

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 12)
    : currentUser.password_hash;
  const role = input.role === undefined ? currentUser.role : normalizeRole(input.role);

  try {
    const result = await database.query<User>(
      `UPDATE users
       SET email = $1, password_hash = $2, role = $3
       WHERE id = $4
       RETURNING ${userFields}`,
      [email, passwordHash, role, id]
    );

    return toUserResponse(result.rows[0]);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      throw new HttpError(409, "User email already exists");
    }

    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  const result = await database.query("DELETE FROM users WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new HttpError(404, "User not found");
  }
};

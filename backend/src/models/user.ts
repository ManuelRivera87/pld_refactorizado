export type User = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
};

export type SafeUser = {
  id: string;
  email: string;
  role: string;
};

export type UserResponse = SafeUser & {
  created_at: Date;
  updated_at: Date;
};

export type CreateUserInput = {
  email?: string;
  password?: string;
  role?: string;
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  role?: string;
};

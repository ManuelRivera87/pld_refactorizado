import dotenv from "dotenv";

dotenv.config();

const parsePort = (value: string | undefined) => {
  const port = Number(value ?? 4000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
};

const parseCorsOrigins = (value: string | undefined) => {
  const origins = value ?? "http://localhost:5173,http://127.0.0.1:5173";

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN),
  databaseUrl:
    process.env.DATABASE_URL ?? "postgres://postgres:root@localhost:5432/pld",
  jwtSecret: process.env.JWT_SECRET ?? "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h"
};

import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const database = new Pool({
  connectionString: env.databaseUrl
});

export const connectDatabase = async () => {
  const client = await database.connect();

  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connection established");
  } finally {
    client.release();
  }
};

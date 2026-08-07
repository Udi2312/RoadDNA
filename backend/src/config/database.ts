// src/config/database.ts
import { Pool } from "pg";
import { config } from "./index";
import { logger } from "./logger";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => logger.debug("New DB connection established"));
pool.on("error", (err) => logger.error({ err }, "Unexpected DB pool error"));

// Quick test function
export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT NOW()");
    logger.info(`✅ Database connected at ${res.rows[0].now}`);
  } finally {
    client.release();
  }
}

// src/config/database.ts
import { Pool, PoolClient } from "pg";
import { config } from "./index";
import { logger } from "./logger";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  // Use slightly larger timeouts to accommodate occasional DNS/network slowness
  idleTimeoutMillis: 30000, // Close idle clients after 30s to prevent Neon serverless timeout issues
  connectionTimeoutMillis: 20000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("connect", () => logger.debug("New DB connection established"));

// Handle unexpected errors on idle clients so they don't crash the app
pool.on("error", (err) => {
  logger.warn({ err: err.message }, "DB pool idle client connection reset by host");
});

/**
 * Executes a query with automatic retry if the Neon database connection was terminated unexpectedly.
 */
export async function queryWithRetry<T = any>(
  text: string,
  params?: any[],
  retries = 2
): Promise<{ rows: T[]; rowCount: number | null }> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const result = await pool.query(text, params);
      return { rows: result.rows as T[], rowCount: result.rowCount };
    } catch (err: any) {
      attempt++;
      const isConnectionError =
        err.message?.includes("Connection terminated unexpectedly") ||
        err.message?.includes("closed the connection unexpectedly") ||
        err.message?.includes("getaddrinfo") ||
        err.code === "57P01" || // admin_shutdown
        err.code === "57P02" || // crash_shutdown
        err.code === "57P03" || // cannot_connect_now
        err.code === "EAI_AGAIN" || // DNS lookup timed out / temporary failure
        err.code === "ENOTFOUND" ||
        err.code === "ECONNRESET";

      if (isConnectionError && attempt <= retries) {
        logger.warn(
          `DB connection dropped by Neon serverless. Retrying query (attempt ${attempt}/${retries})...`
        );
        // Short pause before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Query retry failed");
}

// Quick test function
export async function testConnection(): Promise<void> {
  try {
    const res = await pool.query("SELECT NOW()");
    logger.info(`✅ Database connected at ${res.rows[0].now}`);
  } catch (err: any) {
    logger.error({ err: err.message }, "❌ Database connection test failed");
  }
}

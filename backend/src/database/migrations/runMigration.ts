// ─── Migration runner ───
// Reads schema.sql from the RoadDNA reference folder and applies it.
// Usage: npm run db:migrate

import fs from "fs";
import path from "path";
import { pool } from "../../config/database";
import { logger } from "../../config/logger";

async function runMigration(): Promise<void> {
  const schemaPath = path.resolve(
    process.cwd(),
    "..",
    "RoadDNA",
    "schema.sql"
  );

  if (!fs.existsSync(schemaPath)) {
    logger.error(`Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, "utf-8");

  logger.info("Applying database schema...");

  try {
    await pool.query(sql);
    logger.info("✅ Database schema applied successfully");
  } catch (err: any) {
    // "already exists" errors are fine — means the schema was applied before
    if (err.code === "42710" || err.message?.includes("already exists")) {
      logger.warn("Schema already applied (some objects already exist)");
    } else {
      logger.error({ err }, "❌ Failed to apply schema");
      throw err;
    }
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

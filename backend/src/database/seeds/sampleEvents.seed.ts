// ─── Seed script ───
// Reads sample_sensor_events.csv and inserts all 800 rows into the DB.
// Also seeds the devices table and classified_events (using CSV labels).
// Usage: npm run db:seed

import fs from "fs";
import path from "path";
import { pool } from "../../config/database";
import { logger } from "../../config/logger";

interface CsvRow {
  event_id: string;
  device_id: string;
  timestamp: string;
  latitude: string;
  longitude: string;
  speed_kmh: string;
  accel_x: string;
  accel_y: string;
  accel_z: string;
  accel_magnitude: string;
  gyro_x: string;
  gyro_y: string;
  gyro_z: string;
  label: string;
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().replace(/\r\n/g, "\n").split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() ?? "";
    });
    return row as unknown as CsvRow;
  });
}

async function seed(): Promise<void> {
  const csvPath = path.resolve(
    process.cwd(),
    "..",
    "RoadDNA",
    "sample_sensor_events.csv"
  );

  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCsv(csvPath);
  logger.info(`Parsed ${rows.length} events from CSV`);

  // ─── 1. Insert unique devices ───
  const uniqueDevices = [...new Set(rows.map((r) => r.device_id))];
  for (const deviceId of uniqueDevices) {
    await pool.query(
      `INSERT INTO devices (device_id) VALUES ($1)
       ON CONFLICT (device_id) DO NOTHING`,
      [deviceId]
    );
  }
  logger.info(`✅ Inserted/verified ${uniqueDevices.length} devices`);

  // ─── 2. Insert sensor events ───
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await pool.query(
        `INSERT INTO sensor_events
           (event_id, device_id, recorded_at, location, speed_kmh,
            accel_x, accel_y, accel_z, accel_magnitude,
            gyro_x, gyro_y, gyro_z)
         VALUES
           ($1, $2, $3, ST_MakePoint($4, $5)::geography, $6,
            $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (event_id) DO NOTHING`,
        [
          row.event_id,
          row.device_id,
          row.timestamp,
          parseFloat(row.longitude),
          parseFloat(row.latitude),
          parseFloat(row.speed_kmh),
          parseFloat(row.accel_x),
          parseFloat(row.accel_y),
          parseFloat(row.accel_z),
          parseFloat(row.accel_magnitude),
          parseFloat(row.gyro_x),
          parseFloat(row.gyro_y),
          parseFloat(row.gyro_z),
        ]
      );
      inserted++;
    } catch (err) {
      skipped++;
      logger.warn({ err, event_id: row.event_id }, "Skipped event");
    }
  }
  logger.info(`✅ Seeded ${inserted} sensor events (${skipped} skipped)`);

  // ─── 3. Seed classified_events using the CSV label column ───
  let classified = 0;

  for (const row of rows) {
    if (!row.label) continue;
    try {
      await pool.query(
        `INSERT INTO classified_events
           (event_id, predicted_label, confidence, model_version)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (event_id) DO NOTHING`,
        [row.event_id, row.label, 0.95, "seed-v0.0"]
      );
      classified++;
    } catch {
      // Skip — event might not exist
    }
  }
  logger.info(`✅ Seeded ${classified} classified events`);

  await pool.end();
}

seed()
  .then(() => {
    logger.info("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err }, "Seeding failed");
    process.exit(1);
  });

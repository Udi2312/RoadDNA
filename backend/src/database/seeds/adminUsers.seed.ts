import bcrypt from "bcryptjs";
import { pool } from "../../config/database";
import { config } from "../../config";
import { logger } from "../../config/logger";

async function seedAdmin(): Promise<void> {
  const email = config.adminEmail;
  const password = config.adminPassword;
  const fullName = config.adminFullName;
  const role = "admin";

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await pool.query(
    `INSERT INTO admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
    [email.toLowerCase(), passwordHash, fullName, role]
  );

  logger.info(`✅ Initial admin user created/updated from .env config: ${email}`);
  await pool.end();
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Admin seeding failed");
    process.exit(1);
  });

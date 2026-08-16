import dotenv from "dotenv";
dotenv.config({ override: true });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: process.env.JWT_SECRET || "roaddna_super_secret_jwt_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "roaddna_super_secret_refresh_key_2026",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@roaddna.gov",
  adminPassword: process.env.ADMIN_PASSWORD || "AdminPassword123!",
  adminFullName: process.env.ADMIN_FULL_NAME || "Lead City Engineer",
  /** FastAPI AI microservice base URL (no trailing slash). Empty disables classify calls. */
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
};
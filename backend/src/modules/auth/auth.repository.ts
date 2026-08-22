import { queryWithRetry } from "../../config/database";
import { AdminUserRow } from "./auth.types";
import { RegisterInput } from "./auth.validation";

export async function findUserByEmail(email: string): Promise<AdminUserRow | null> {
  const result = await queryWithRetry<AdminUserRow>(
    `SELECT admin_id, email, password_hash, full_name, role, created_at
     FROM admin_users
     WHERE email = $1`,
    [email.toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function findUserById(adminId: string): Promise<AdminUserRow | null> {
  const result = await queryWithRetry<AdminUserRow>(
    `SELECT admin_id, email, password_hash, full_name, role, created_at
     FROM admin_users
     WHERE admin_id = $1`,
    [adminId]
  );
  return result.rows[0] || null;
}

export async function createUser(
  input: RegisterInput,
  passwordHash: string
): Promise<AdminUserRow> {
  const result = await queryWithRetry<AdminUserRow>(
    `INSERT INTO admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING admin_id, email, password_hash, full_name, role, created_at`,
    [input.email.toLowerCase(), passwordHash, input.full_name, input.role]
  );
  return result.rows[0];
}

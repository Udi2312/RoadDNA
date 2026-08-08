import { AdminRole } from "../../shared/constants";

export interface AdminUserRow {
  admin_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: AdminRole;
  created_at: Date;
}

export interface UserResponse {
  admin_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  created_at: Date;
}

export interface JWTPayload {
  admin_id: string;
  email: string;
  role: AdminRole;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { AppError } from "../../shared/utils/AppError";
import * as repo from "./auth.repository";
import { AdminUserRow, AuthTokens, JWTPayload, UserResponse } from "./auth.types";
import { LoginInput, RegisterInput } from "./auth.validation";

function toUserResponse(user: AdminUserRow): UserResponse {
  return {
    admin_id: user.admin_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    created_at: user.created_at,
  };
}

export function generateTokens(payload: JWTPayload): { token: string; refreshToken: string } {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as any,
  });
  return { token, refreshToken };
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = await repo.findUserByEmail(input.email);
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, user.password_hash);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const payload: JWTPayload = {
    admin_id: user.admin_id,
    email: user.email,
    role: user.role,
  };

  const { token, refreshToken } = generateTokens(payload);

  return {
    token,
    refreshToken,
    user: toUserResponse(user),
  };
}

export async function register(input: RegisterInput): Promise<AuthTokens> {
  const existingUser = await repo.findUserByEmail(input.email);
  if (existingUser) {
    throw AppError.badRequest("User with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  const newUser = await repo.createUser(input, passwordHash);

  const payload: JWTPayload = {
    admin_id: newUser.admin_id,
    email: newUser.email,
    role: newUser.role,
  };

  const { token, refreshToken } = generateTokens(payload);

  return {
    token,
    refreshToken,
    user: toUserResponse(newUser),
  };
}

export async function getUserProfile(adminId: string): Promise<UserResponse> {
  const user = await repo.findUserById(adminId);
  if (!user) {
    throw AppError.notFound("User profile not found");
  }
  return toUserResponse(user);
}

export async function refreshAccessToken(refreshTokenInput: string): Promise<{ token: string }> {
  try {
    const decoded = jwt.verify(refreshTokenInput, config.jwtRefreshSecret) as JWTPayload;
    const user = await repo.findUserById(decoded.admin_id);
    if (!user) {
      throw AppError.unauthorized("Invalid refresh token");
    }

    const payload: JWTPayload = {
      admin_id: user.admin_id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    return { token };
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }
}

import { Request, Response } from "express";
import { sendSuccess } from "../../shared/utils/apiResponse";
import * as service from "./auth.service";
import { LoginInput, RegisterInput } from "./auth.validation";

export async function login(req: Request, res: Response): Promise<void> {
  const result = await service.login(req.body as LoginInput);
  sendSuccess(res, result, 200);
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await service.register(req.body as RegisterInput);
  sendSuccess(res, result, 201);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const profile = await service.getUserProfile(req.user!.admin_id);
  sendSuccess(res, profile, 200);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  const result = await service.refreshAccessToken(refreshToken);
  sendSuccess(res, result, 200);
}

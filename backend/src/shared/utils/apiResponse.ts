// ─── Standardized API response helpers ───
// Every controller uses these — never send raw res.json() directly.

import { Response } from "express";
import { PaginatedResponse } from "../types";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>["pagination"]
): void {
  res.status(200).json({ success: true, data, pagination });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): void {
  res.status(statusCode).json({ success: false, message, errors });
}

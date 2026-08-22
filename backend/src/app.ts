// ─── Express application factory ───
// Creates and configures the app with all middleware + routes.
// Separated from server.ts so the app can be used in tests without starting a listener.

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";

import authRoutes from "./modules/auth/auth.routes";
import sensorEventRoutes from "./modules/sensor-events/sensorEvent.routes";
import clusterRoutes from "./modules/clusters/cluster.routes";
import workOrderRoutes from "./modules/work-orders/workOrder.routes";
import citizenReportRoutes from "./modules/citizen-reports/citizenReport.routes";

export function createApp() {
  const app = express();

  // ─── Global middleware ───
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  // ─── Health check ───
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "roaddna-backend", timestamp: new Date().toISOString() });
  });

  // ─── API v1 routes ───
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/sensor-events", sensorEventRoutes);
  app.use("/api/v1/clusters", clusterRoutes);
  app.use("/api/v1/work-orders", workOrderRoutes);
  app.use("/api/v1/citizen-reports", citizenReportRoutes);

  // ─── 404 fallback ───
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // ─── Global error handler (must be last) ───
  app.use(errorHandler);

  return app;
}
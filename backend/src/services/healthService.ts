import type { HealthStatus } from "../models/health.js";

export const getHealthStatus = (): HealthStatus => ({
  status: "ok",
  message: "Backend funcionando",
  service: "pld-backend",
  timestamp: new Date().toISOString()
});

import { Router } from "express";
import { healthController } from "../controllers/healthController.js";

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica que el backend esta funcionando
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Backend funcionando correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Backend funcionando
 *                 service:
 *                   type: string
 *                   example: pld-backend
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
healthRouter.get("/", healthController);

import { Router } from "express";
import { upload } from "../config/upload.js";
import {
  downloadCreditXmlController,
  generateCreditXmlController,
  getMyUploadDashboardController,
  listReportUploadsController,
  uploadCreditReportController
} from "../controllers/reportController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportsRouter = Router();

/**
 * @openapi
 * /informes/mis-cargas/resumen:
 *   get:
 *     summary: Resume las cargas realizadas por el usuario autenticado
 *     tags: [Informes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de cargas del usuario actual.
 */
reportsRouter.get(
  "/mis-cargas/resumen",
  asyncHandler(getMyUploadDashboardController)
);

/**
 * @openapi
 * /informes/cargas:
 *   get:
 *     summary: Lista cargas de informes realizadas
 *     tags: [Informes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cargas de informes realizadas.
 */
reportsRouter.get("/cargas", asyncHandler(listReportUploadsController));

/**
 * @openapi
 * /informes/creditos/cargar:
 *   post:
 *     summary: Carga un archivo XLS de informe de creditos
 *     tags: [Informes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [companyId, mesAfectacion, anioAfectacion, file]
 *             properties:
 *               companyId:
 *                 type: string
 *                 format: uuid
 *               mesAfectacion:
 *                 type: integer
 *                 example: 4
 *               anioAfectacion:
 *                 type: integer
 *                 example: 2025
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Informe de creditos cargado correctamente.
 */
reportsRouter.post(
  "/creditos/cargar",
  upload.single("file"),
  asyncHandler(uploadCreditReportController)
);

/**
 * @openapi
 * /informes/creditos/{uploadId}/xml:
 *   post:
 *     summary: Genera y guarda el XML SAT de una carga de creditos
 *     tags: [Informes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: XML de creditos generado correctamente.
 *       404:
 *         description: Carga de creditos no encontrada.
 */
reportsRouter.post(
  "/creditos/:uploadId/xml",
  asyncHandler(generateCreditXmlController)
);

/**
 * @openapi
 * /informes/creditos/xml/{xmlExportId}/download:
 *   get:
 *     summary: Descarga un XML de creditos generado
 *     tags: [Informes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: xmlExportId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Archivo XML.
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       404:
 *         description: XML de creditos no encontrado.
 */
reportsRouter.get(
  "/creditos/xml/:xmlExportId/download",
  asyncHandler(downloadCreditXmlController)
);

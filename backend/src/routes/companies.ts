import { Router } from "express";
import {
  createCompanyController,
  deleteCompanyController,
  getCompanyController,
  listCompaniesController,
  updateCompanyController
} from "../controllers/companyController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const companiesRouter = Router();

/**
 * @openapi
 * /empresas:
 *   get:
 *     summary: Lista empresas
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas.
 *   post:
 *     summary: Crea una empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Autocom Nissan
 *               rfc:
 *                 type: string
 *                 example: AUT000000XXX
 *     responses:
 *       201:
 *         description: Empresa creada.
 */
companiesRouter
  .route("/")
  .get(asyncHandler(listCompaniesController))
  .post(requireRole("admin"), asyncHandler(createCompanyController));

/**
 * @openapi
 * /empresas/{id}:
 *   get:
 *     summary: Obtiene una empresa por id
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Empresa encontrada.
 *   put:
 *     summary: Actualiza una empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rfc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empresa actualizada.
 *   delete:
 *     summary: Elimina una empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Empresa eliminada.
 */
companiesRouter
  .route("/:id")
  .get(asyncHandler(getCompanyController))
  .put(requireRole("admin"), asyncHandler(updateCompanyController))
  .delete(requireRole("admin"), asyncHandler(deleteCompanyController));

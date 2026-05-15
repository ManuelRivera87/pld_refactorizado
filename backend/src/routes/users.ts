import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserController,
  listUsersController,
  updateUserController
} from "../controllers/userController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usersRouter = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Lista usuarios registrados
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *   post:
 *     summary: Crea un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@autocom.mx
 *               password:
 *                 type: string
 *                 example: autocom2026
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: Usuario creado.
 */
usersRouter
  .route("/")
  .get(asyncHandler(listUsersController))
  .post(asyncHandler(createUserController));

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por id
 *     tags: [Users]
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
 *         description: Usuario encontrado.
 *   put:
 *     summary: Actualiza un usuario
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado.
 *   delete:
 *     summary: Elimina un usuario
 *     tags: [Users]
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
 *         description: Usuario eliminado.
 */
usersRouter
  .route("/:id")
  .get(asyncHandler(getUserController))
  .put(asyncHandler(updateUserController))
  .delete(asyncHandler(deleteUserController));

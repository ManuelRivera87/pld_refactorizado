import { Router } from "express";
import { authRouter } from "./auth.js";
import { companiesRouter } from "./companies.js";
import { healthRouter } from "./health.js";
import { authenticate } from "../middlewares/authenticate.js";
import { reportsRouter } from "./reports.js";
import { usersRouter } from "./users.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/companies", authenticate, companiesRouter);
apiRouter.use("/empresas", authenticate, companiesRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use("/informes", authenticate, reportsRouter);
apiRouter.use("/users", authenticate, usersRouter);

import { Router } from "express";
import { validate } from "../../middleware/validator.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), controller.login);

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), controller.register);

// GET /api/v1/auth/me (Protected)
router.get("/me", authenticate, controller.getMe);

// POST /api/v1/auth/refresh
router.post("/refresh", controller.refresh);

export default router;

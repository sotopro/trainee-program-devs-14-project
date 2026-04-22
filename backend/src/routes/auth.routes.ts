import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateMiddleware } from '../middleware/validate.middleware.js';
import { loginSchema } from '../modules/auth/schemas/loginSchema.js';
import { registerSchema } from '../modules/auth/schemas/registerSchema.js';

const router = Router();

router.post('/register', validateMiddleware(registerSchema), register);
router.post('/login', validateMiddleware(loginSchema), login);

export default router;

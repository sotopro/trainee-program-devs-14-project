import { Router } from 'express';
import { register } from '../controllers/auth.controller.js';
import { validateMiddleware } from '../middleware/validate.middleware.js';
import { registerSchema } from '../modules/auth/schemas/registerSchema.js';

const router = Router();

router.post('/register', validateMiddleware(registerSchema), register);

export default router;

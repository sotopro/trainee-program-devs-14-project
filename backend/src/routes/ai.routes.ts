import { Router } from 'express';
import {
  generateCourse,
  chat,
  confirmCourse,
  generateContent,
  generateQuiz,
  getRecommendations,
  expandPath,
} from '../controllers/ai.controller.js';
import { aiRateLimit, authMiddleware, roleMiddleware } from '../middleware/index.js';

const router = Router();

router.use(authMiddleware);
router.use(aiRateLimit);

router.post('/generate-course', roleMiddleware(['ADMIN']), generateCourse);
router.post('/chat/:conversationId', roleMiddleware(['ADMIN']), chat);
router.post('/confirm-course/:conversationId', roleMiddleware(['ADMIN']), confirmCourse);
router.post('/generate-content/:lessonId', roleMiddleware(['ADMIN']), generateContent);
router.post('/generate-quiz/:lessonId', roleMiddleware(['ADMIN']), generateQuiz);
router.get('/recommendations/:lessonId', getRecommendations);
router.post('/expand-path/:pathId', expandPath);

export default router;

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
import { aiRateLimit } from '../middleware/ai-rate-limit.middleware.js';

const router = Router();

router.use(aiRateLimit);

router.post('/generate-course', generateCourse);
router.post('/chat/:conversationId', chat);
router.post('/confirm-course/:conversationId', confirmCourse);
router.post('/generate-content/:lessonId', generateContent);
router.post('/generate-quiz/:lessonId', generateQuiz);
router.get('/recommendations/:lessonId', getRecommendations);
router.post('/expand-path/:pathId', expandPath);

export default router;

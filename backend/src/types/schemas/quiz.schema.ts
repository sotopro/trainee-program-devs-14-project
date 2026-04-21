import { z } from 'zod';

export const quizQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
});

export const quizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(5).max(10),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizData = z.infer<typeof quizSchema>;

import { z } from 'zod';

export const recommendationSchema = z.object({
  type: z.enum(['QUESTION', 'TOPIC', 'RESOURCE']),
  content: z.string().min(10),
  metadata: z.record(z.string(), z.unknown()),
});

export const recommendationsResponseSchema = z.object({
  recommendations: z.array(recommendationSchema).min(3),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;

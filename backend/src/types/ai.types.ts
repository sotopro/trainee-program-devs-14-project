export * from './schemas/editor-content.schema.js';
export * from './schemas/course-proposal.schema.js';
export * from './schemas/recommendation.schema.js';
export * from './schemas/quiz.schema.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIServiceOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

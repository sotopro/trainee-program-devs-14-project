import OpenAI from 'openai';
import type { ChatMessage, AIServiceOptions } from '../types/ai.types.js';
import { AppError } from '../utils/app-error.js';

const OPENAI_TIMEOUT = 30000;

class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-replace-with-real-key',
      timeout: OPENAI_TIMEOUT,
    });
  }

  async sendMessage(systemPrompt: string, userMessage: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError(502, 'Respuesta vacia del servicio de IA');
      }

      return content;
    } catch (error) {
      this.handleOpenAIError(error);
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming['response_format'],
  ): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: schema,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError(502, 'Respuesta vacia del servicio de IA');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      this.handleOpenAIError(error);
    }
  }

  async *chatStream(
    messages: ChatMessage[],
    options?: AIServiceOptions,
  ): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        stream: true,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.handleOpenAIError(error);
    }
  }

  private handleOpenAIError(error: unknown): never {
    if (error instanceof Error) {
      if (error.name === 'RateLimitError') {
        throw new AppError(429, 'Limite de la API de OpenAI alcanzado');
      }
      if (error.name === 'APITimeoutError' || error.message.includes('timeout')) {
        throw new AppError(504, 'Timeout al comunicarse con OpenAI');
      }
      if (error.name === 'APIError') {
        throw new AppError(502, 'Error en el servicio de IA');
      }
    }
    if (error instanceof SyntaxError) {
      throw new AppError(502, 'Respuesta invalida del servicio de IA');
    }
    throw error;
  }
}

export const aiService = new AIService();

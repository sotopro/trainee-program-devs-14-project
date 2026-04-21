import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { courseProposalSchema, type CourseProposal } from '../types/schemas/course-proposal.schema.js';
import { buildCourseGenerationPrompt, courseRefinementPrompt } from '../prompts/course-generation.js';
import { AppError } from '../utils/app-error.js';
import type { ChatMessage } from '../types/ai.types.js';

class CourseGenerationService {
  async generateCourse(
    userId: string,
    topic: string,
    level: string,
    targetAudience: string,
  ): Promise<{ conversationId: string; proposal: CourseProposal }> {
    const prompt = buildCourseGenerationPrompt(topic, level, targetAudience);

    const proposal = await aiService.generateStructured(prompt, {
      type: 'json_object',
    });

    const validatedProposal = courseProposalSchema.parse(proposal);

    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        type: 'COURSE_GENERATION',
        messages: [
          { role: 'user', content: `Tema: ${topic}, Nivel: ${level}, Audiencia: ${targetAudience}` },
          { role: 'assistant', content: JSON.stringify(validatedProposal) },
        ],
        lastProposal: validatedProposal as unknown as object,
        status: 'ACTIVE',
      },
    });

    return {
      conversationId: conversation.id,
      proposal: validatedProposal,
    };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    message: string,
  ): Promise<{ conversationId: string; proposal: CourseProposal }> {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversacion no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new AppError(403, 'No tienes acceso a esta conversacion');
    }

    if (conversation.status !== 'ACTIVE') {
      throw new AppError(400, 'La conversacion ya no esta activa');
    }

    const messages = conversation.messages as unknown as ChatMessage[];
    const currentProposal = conversation.lastProposal as CourseProposal;

    const historyText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const refinementPrompt = courseRefinementPrompt
      .replace('{history}', historyText)
      .replace('{currentProposal}', JSON.stringify(currentProposal))
      .replace('{message}', message);

    const proposal = await aiService.generateStructured(refinementPrompt, {
      type: 'json_object',
    });

    const validatedProposal = courseProposalSchema.parse(proposal);

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messages: {
          push: [
            { role: 'user', content: message },
            { role: 'assistant', content: JSON.stringify(validatedProposal) },
          ],
        },
        lastProposal: validatedProposal as unknown as object,
      },
    });

    return {
      conversationId,
      proposal: validatedProposal,
    };
  }

  async confirmCourse(
    userId: string,
    conversationId: string,
  ): Promise<{
    courseId: string;
    title: string;
    modulesCreated: number;
    lessonsCreated: number;
    learningPathId: string;
  }> {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversacion no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new AppError(403, 'No tienes acceso a esta conversacion');
    }

    if (conversation.status === 'CONFIRMED' && conversation.courseId) {
      const existingCourse = await prisma.course.findUnique({
        where: { id: conversation.courseId },
        include: { modules: { include: { lessons: true } } },
      });

      if (existingCourse) {
        return {
          courseId: existingCourse.id,
          title: existingCourse.title,
          modulesCreated: existingCourse.modules.length,
          lessonsCreated: existingCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0),
          learningPathId: conversation.courseId,
        };
      }
    }

    const proposal = conversation.lastProposal as CourseProposal;
    let modulesCreated = 0;
    let lessonsCreated = 0;

    const result = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title: proposal.title,
          description: proposal.description,
          category: 'AI Generated',
          difficulty: 'INTERMEDIATE',
          authorId: userId,
          status: 'DRAFT',
        },
      });

      let lessonOrder = 0;
      for (const moduleProposal of proposal.modules) {
        const module = await tx.module.create({
          data: {
            title: moduleProposal.title,
            description: moduleProposal.description,
            order: modulesCreated,
            courseId: course.id,
          },
        });
        modulesCreated++;

        for (const lessonProposal of moduleProposal.lessons) {
          await tx.lesson.create({
            data: {
              title: lessonProposal.title,
              content: JSON.stringify({ time: Date.now(), blocks: [], version: '2.28.0' }),
              type: 'TEXT',
              duration: 15,
              order: lessonOrder,
              moduleId: module.id,
            },
          });
          lessonOrder++;
          lessonsCreated++;
        }
      }

      const learningPath = await tx.learningPath.create({
        data: {
          name: `${proposal.title} - Default Path`,
          userId,
          isForked: false,
        },
      });

      await tx.aIConversation.update({
        where: { id: conversationId },
        data: {
          status: 'CONFIRMED',
          courseId: course.id,
        },
      });

      return { courseId: course.id, learningPathId: learningPath.id };
    });

    return {
      courseId: result.courseId,
      title: proposal.title,
      modulesCreated,
      lessonsCreated,
      learningPathId: result.learningPathId,
    };
  }
}

export const courseGenerationService = new CourseGenerationService();

import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/app-error.js';

const listLessonsByModule = async (moduleId: string) => {
  const module = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
    },
  });

  if (!module) {
    throw new NotFoundError('Modulo no encontrado');
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      moduleId,
    },
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      title: true,
      order: true,
      moduleId: true,
      createdAt: true,
      _count: {
        select: {
          quizzes: true,
        },
      },
    },
  });

  return lessons.map(({ _count, ...lesson }) => ({
    ...lesson,
    hasQuiz: _count.quizzes > 0,
  }));
};

export const lessonService = {
  listLessonsByModule,
};

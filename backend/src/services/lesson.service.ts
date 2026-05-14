import { prisma } from '../config/prisma.js';
import type {
  CreateLessonInput,
  UpdateLessonInput,
} from '../modules/lessons/schemas/createLessonSchema.js';
import { NotFoundError } from '../utils/app-error.js';

const DEFAULT_LESSON_DURATION = 0;
const DEFAULT_EDITOR_CONTENT = {
  time: 0,
  blocks: [],
  version: '2.28.0',
};

const parseLessonContent = (content: string) => {
  try {
    const parsedContent = JSON.parse(content) as unknown;

    if (parsedContent && typeof parsedContent === 'object') {
      return parsedContent;
    }
  } catch {
    // Some legacy lessons may still contain plain text content.
  }

  return {
    time: Date.now(),
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: content,
        },
      },
    ],
  };
};

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

const getLessonById = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      title: true,
      content: true,
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

  if (!lesson) {
    throw new NotFoundError('Leccion no encontrada');
  }

  const { _count, content, ...lessonData } = lesson;

  return {
    ...lessonData,
    content: parseLessonContent(content),
    hasQuiz: _count.quizzes > 0,
  };
};

const createLesson = async (moduleId: string, input: CreateLessonInput) => {
  return prisma.$transaction(async (tx) => {
    const module = await tx.module.findUnique({
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

    const orderAggregate = await tx.lesson.aggregate({
      where: {
        moduleId,
      },
      _max: {
        order: true,
      },
    });
    const nextOrder = (orderAggregate._max.order ?? 0) + 1;

    const lesson = await tx.lesson.create({
      data: {
        title: input.title,
        content: JSON.stringify(input.content ?? DEFAULT_EDITOR_CONTENT),
        duration: DEFAULT_LESSON_DURATION,
        order: nextOrder,
        moduleId,
      },
      select: {
        id: true,
        title: true,
        content: true,
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

    const { _count, content, ...lessonData } = lesson;

    return {
      ...lessonData,
      content: parseLessonContent(content),
      hasQuiz: _count.quizzes > 0,
    };
  });
};

const updateLesson = async (lessonId: string, input: UpdateLessonInput) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
    },
  });

  if (!existingLesson) {
    throw new NotFoundError('Leccion no encontrada');
  }

  const lesson = await prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data: {
      title: input.title,
      content: JSON.stringify(input.content),
    },
    select: {
      id: true,
      title: true,
      content: true,
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

  const { _count, content, ...lessonData } = lesson;

  return {
    ...lessonData,
    content: parseLessonContent(content),
    hasQuiz: _count.quizzes > 0,
  };
};

const deleteLesson = async (lessonId: string) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
    },
  });

  if (!existingLesson) {
    throw new NotFoundError('Leccion no encontrada');
  }

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.deleteMany({
      where: {
        quiz: {
          lessonId,
        },
      },
    });

    await tx.quiz.deleteMany({
      where: {
        lessonId,
      },
    });

    await tx.progress.deleteMany({
      where: {
        lessonId,
      },
    });

    await tx.learningPathItem.deleteMany({
      where: {
        lessonId,
      },
    });

    await tx.lesson.delete({
      where: {
        id: lessonId,
      },
    });
  });
};

export const lessonService = {
  createLesson,
  deleteLesson,
  getLessonById,
  listLessonsByModule,
  updateLesson,
};

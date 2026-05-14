import { prisma } from '../config/prisma.js';
import type {
  CreateModuleInput,
  ReorderModulesInput,
  UpdateModuleInput,
} from '../modules/courses/schemas/moduleSchema.js';
import { ConflictError, NotFoundError } from '../utils/app-error.js';

const moduleSummarySelect = {
  id: true,
  title: true,
  description: true,
  order: true,
  courseId: true,
  createdAt: true,
  _count: {
    select: {
      lessons: true,
    },
  },
} as const;

const mapModuleSummary = ({
  _count,
  ...module
}: {
  id: string;
  title: string;
  description: string | null;
  order: number;
  courseId: string;
  createdAt: Date;
  _count: {
    lessons: number;
  };
}) => ({
  ...module,
  lessonCount: _count.lessons,
});

const listModulesByCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new NotFoundError('Curso no encontrado');
  }

  const modules = await prisma.module.findMany({
    where: {
      courseId,
    },
    orderBy: {
      order: 'asc',
    },
    select: moduleSummarySelect,
  });

  return modules.map(mapModuleSummary);
};

const createModule = async (courseId: string, input: CreateModuleInput) => {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    const orderAggregate = await tx.module.aggregate({
      where: {
        courseId,
      },
      _max: {
        order: true,
      },
    });
    const nextOrder = (orderAggregate._max.order ?? 0) + 1;

    const module = await tx.module.create({
      data: {
        title: input.title,
        description: input.description,
        order: nextOrder,
        courseId,
      },
      select: moduleSummarySelect,
    });

    return mapModuleSummary(module);
  });
};

const updateModule = async (moduleId: string, input: UpdateModuleInput) => {
  const existingModule = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
    },
  });

  if (!existingModule) {
    throw new NotFoundError('Modulo no encontrado');
  }

  const module = await prisma.module.update({
    where: {
      id: moduleId,
    },
    data: {
      title: input.title,
      description: input.description,
    },
    select: moduleSummarySelect,
  });

  return mapModuleSummary(module);
};

const reorderModules = async (input: ReorderModulesInput) => {
  const moduleIds = input.modules.map((module) => module.id);
  const uniqueModuleIds = new Set(moduleIds);

  if (uniqueModuleIds.size !== moduleIds.length) {
    throw new ConflictError('No puedes enviar modulos duplicados para reordenar');
  }

  const existingModules = await prisma.module.findMany({
    where: {
      id: {
        in: moduleIds,
      },
    },
    select: {
      id: true,
      courseId: true,
    },
  });

  if (existingModules.length !== moduleIds.length) {
    throw new NotFoundError('Uno o mas modulos no fueron encontrados');
  }

  const courseIds = new Set(existingModules.map((module) => module.courseId));

  if (courseIds.size > 1) {
    throw new ConflictError('Todos los modulos deben pertenecer al mismo curso');
  }

  return prisma.$transaction(async (tx) => {
    let temporaryOrder = -1;

    for (const module of input.modules) {
      await tx.module.update({
        where: {
          id: module.id,
        },
        data: {
          order: temporaryOrder,
        },
      });

      temporaryOrder -= 1;
    }

    for (const module of input.modules) {
      await tx.module.update({
        where: {
          id: module.id,
        },
        data: {
          order: module.order,
        },
      });
    }

    const updatedModules = await tx.module.findMany({
      where: {
        id: {
          in: moduleIds,
        },
      },
      orderBy: {
        order: 'asc',
      },
      select: moduleSummarySelect,
    });

    return updatedModules.map(mapModuleSummary);
  });
};

const deleteModule = async (moduleId: string) => {
  const module = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      lessons: {
        select: {
          id: true,
          quizzes: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!module) {
    throw new NotFoundError('Modulo no encontrado');
  }

  const lessonIds = module.lessons.map((lesson) => lesson.id);
  const quizIds = module.lessons.flatMap((lesson) => lesson.quizzes.map((quiz) => quiz.id));

  await prisma.$transaction(async (tx) => {
    if (quizIds.length > 0) {
      await tx.quizAttempt.deleteMany({
        where: {
          quizId: {
            in: quizIds,
          },
        },
      });
    }

    if (lessonIds.length > 0) {
      await tx.quiz.deleteMany({
        where: {
          lessonId: {
            in: lessonIds,
          },
        },
      });

      await tx.progress.deleteMany({
        where: {
          lessonId: {
            in: lessonIds,
          },
        },
      });

      await tx.learningPathItem.deleteMany({
        where: {
          lessonId: {
            in: lessonIds,
          },
        },
      });

      await tx.recommendation.deleteMany({
        where: {
          lessonId: {
            in: lessonIds,
          },
        },
      });

      await tx.lesson.deleteMany({
        where: {
          moduleId,
        },
      });
    }

    await tx.module.delete({
      where: {
        id: moduleId,
      },
    });
  });
};

export const moduleService = {
  createModule,
  deleteModule,
  listModulesByCourse,
  reorderModules,
  updateModule,
};

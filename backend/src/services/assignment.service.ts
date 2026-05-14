import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { AssignableUsersQuery } from '../modules/courses/schemas/assignableUsersQuerySchema.js';
import type { AssignCourseInput } from '../modules/courses/schemas/assignCourseSchema.js';
import { ConflictError, NotFoundError } from '../utils/app-error.js';

const assignCourse = async (courseId: string, input: AssignCourseInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const [course, user] = await Promise.all([
        tx.course.findUnique({
          where: {
            id: courseId,
          },
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        }),
        tx.user.findUnique({
          where: {
            id: input.userId,
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (!course) {
        throw new NotFoundError('Curso no encontrado');
      }

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingEnrollment) {
        throw new ConflictError('El usuario ya esta asignado a este curso');
      }

      const defaultLearningPath =
        (await tx.learningPath.findFirst({
          where: {
            courseId,
            isDefault: true,
          },
          select: {
            id: true,
          },
        })) ??
        (await tx.learningPath.create({
          data: {
            name: `${course.title} - Default Path`,
            description: 'Ruta por defecto generada para asignaciones del curso.',
            userId: course.authorId,
            courseId,
            isDefault: true,
            isForked: false,
          },
          select: {
            id: true,
          },
        }));

      return tx.enrollment.create({
        data: {
          userId: input.userId,
          courseId,
          learningPathId: defaultLearningPath.id,
        },
        select: {
          id: true,
          userId: true,
          courseId: true,
          learningPathId: true,
          status: true,
          enrolledAt: true,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictError('El usuario ya esta asignado a este curso');
    }

    throw error;
  }
};

const unassignCourse = async (courseId: string, userId: string) => {
  const [course, user] = await Promise.all([
    prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!course) {
    throw new NotFoundError('Curso no encontrado');
  }

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!enrollment) {
    throw new NotFoundError('Asignacion no encontrada');
  }

  await prisma.enrollment.delete({
    where: {
      id: enrollment.id,
    },
  });
};

const listCourseEnrollments = async (courseId: string) => {
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

  const [enrollments, totalLessons] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        courseId,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.lesson.count({
      where: {
        module: {
          courseId,
        },
      },
    }),
  ]);

  const progressByUser = await prisma.progress.groupBy({
    by: ['userId'],
    where: {
      courseId,
      completed: true,
      userId: {
        in: enrollments.map((enrollment) => enrollment.user.id),
      },
    },
    _count: {
      lessonId: true,
    },
  });
  const completedLessonsByUserId = new Map(
    progressByUser.map((progress) => [progress.userId, progress._count.lessonId]),
  );

  return enrollments.map((enrollment) => {
    const completedLessons = completedLessonsByUserId.get(enrollment.user.id) ?? 0;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      id: enrollment.id,
      user: enrollment.user,
      status: enrollment.status,
      progress,
      enrolledAt: enrollment.enrolledAt,
    };
  });
};

const buildAssignableUsersWhere = (
  query: Pick<AssignableUsersQuery, 'search'>,
): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {
    role: Role.USER,
  };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return where;
};

const listAssignableUsers = async (courseId: string, query: AssignableUsersQuery) => {
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

  const where = buildAssignableUsersWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, users, totalLessons] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enrollments: {
          where: {
            courseId,
          },
          take: 1,
          select: {
            id: true,
            status: true,
            enrolledAt: true,
          },
        },
      },
    }),
    prisma.lesson.count({
      where: {
        module: {
          courseId,
        },
      },
    }),
  ]);

  const userIds = users.map((user) => user.id);
  const progressByUser =
    userIds.length > 0
      ? await prisma.progress.groupBy({
          by: ['userId'],
          where: {
            courseId,
            completed: true,
            userId: {
              in: userIds,
            },
          },
          _count: {
            lessonId: true,
          },
        })
      : [];
  const completedLessonsByUserId = new Map(
    progressByUser.map((progress) => [progress.userId, progress._count.lessonId]),
  );

  return {
    data: users.map((user) => {
      const enrollment = user.enrollments[0];
      const completedLessons = completedLessonsByUserId.get(user.id) ?? 0;
      const progress = enrollment && totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedAt: enrollment?.enrolledAt ?? null,
        enrollmentId: enrollment?.id ?? null,
        enrollmentStatus: enrollment?.status ?? null,
        progress,
      };
    }),
    pagination: {
      total,
      totalPages: Math.ceil(total / query.limit),
      currentPage: query.page,
      limit: query.limit,
    },
  };
};

export const assignmentService = {
  assignCourse,
  listAssignableUsers,
  listCourseEnrollments,
  unassignCourse,
};

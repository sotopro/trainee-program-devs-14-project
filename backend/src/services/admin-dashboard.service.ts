import { CourseStatus, EnrollmentStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const listDashboardStats = async () => {
  const [
    totalCourses,
    totalUsers,
    activeEnrollments,
    recentEnrollments,
    recentPublishedCourses,
    recentQuizAttempts,
  ] = await prisma.$transaction([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count({
      where: {
        status: EnrollmentStatus.ACTIVE,
      },
    }),
    prisma.enrollment.findMany({
      take: 10,
      orderBy: {
        enrolledAt: 'desc',
      },
      select: {
        id: true,
        enrolledAt: true,
        user: {
          select: {
            name: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.course.findMany({
      take: 10,
      where: {
        status: CourseStatus.PUBLISHED,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    }),
    prisma.quizAttempt.findMany({
      take: 10,
      orderBy: {
        attemptedAt: 'desc',
      },
      select: {
        id: true,
        score: true,
        attemptedAt: true,
        user: {
          select: {
            name: true,
          },
        },
        quiz: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  const recentActivity = [
    ...recentEnrollments.map((enrollment) => ({
      id: `enrollment-${enrollment.id}`,
      type: 'ENROLLMENT' as const,
      title: 'Nueva inscripcion',
      description: `${enrollment.user.name} se inscribio en ${enrollment.course.title}.`,
      createdAt: enrollment.enrolledAt.toISOString(),
    })),
    ...recentPublishedCourses.map((course) => ({
      id: `course-${course.id}`,
      type: 'COURSE_PUBLISHED' as const,
      title: 'Curso publicado',
      description: `${course.title} esta disponible en el catalogo.`,
      createdAt: course.updatedAt.toISOString(),
    })),
    ...recentQuizAttempts.map((attempt) => ({
      id: `quiz-${attempt.id}`,
      type: 'QUIZ_COMPLETED' as const,
      title: 'Quiz completado',
      description: `${attempt.user.name} completo ${attempt.quiz.title} con puntaje ${attempt.score}.`,
      createdAt: attempt.attemptedAt.toISOString(),
    })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 10);

  return {
    stats: {
      totalCourses,
      totalUsers,
      activeEnrollments,
    },
    recentActivity,
  };
};

export const adminDashboardService = {
  listDashboardStats,
};

import { PrismaClient, Role, CourseDifficulty, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing data...');

  // Orden inverso por FK: primero hijos, luego padres.
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.learningPathItem.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Creating admin user...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin LearnPath',
      email: 'admin@learnpath.dev',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`[Seed] Admin creado: ${admin.email}`);

  console.log('[Seed] Creating sample courses...');

  const reactCourse = await prisma.course.create({
    data: {
      title: 'Fundamentos de React 19',
      description:
        'Aprende los conceptos esenciales de React 19: componentes, hooks, estado y efectos.',
      category: 'Frontend',
      difficulty: CourseDifficulty.BEGINNER,
      status: CourseStatus.PUBLISHED,
      authorId: admin.id,
      modules: {
        create: [
          {
            title: 'Introduccion a React',
            description: 'Primeros pasos: JSX, componentes y props.',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Que es React?',
                  content: 'React es una biblioteca de UI basada en componentes...',
                  type: LessonType.TEXT,
                  duration: 10,
                  order: 1,
                },
                {
                  title: 'Tu primer componente',
                  content: 'Creemos un componente funcional que reciba props...',
                  type: LessonType.CODE,
                  duration: 15,
                  order: 2,
                },
              ],
            },
          },
          {
            title: 'Estado y efectos',
            description: 'useState, useEffect y ciclo de vida.',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'useState explicado',
                  content: 'El hook useState permite agregar estado local...',
                  type: LessonType.TEXT,
                  duration: 12,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const nodeCourse = await prisma.course.create({
    data: {
      title: 'APIs REST con Node.js y Express 5',
      description:
        'Construye APIs robustas con Node.js, Express 5 y TypeScript. Incluye validacion, errores y buenas practicas.',
      category: 'Backend',
      difficulty: CourseDifficulty.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      authorId: admin.id,
      modules: {
        create: [
          {
            title: 'Setup del proyecto',
            description: 'Configuracion inicial de un backend profesional.',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Inicializando Express 5 con TypeScript',
                  content: 'Creamos el proyecto con npm init y configuramos tsconfig...',
                  type: LessonType.CODE,
                  duration: 20,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const dbCourse = await prisma.course.create({
    data: {
      title: 'Bases de datos con Prisma y PostgreSQL',
      description: 'Diseño de esquemas, migraciones, relaciones y queries con Prisma ORM.',
      category: 'Backend',
      difficulty: CourseDifficulty.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      authorId: admin.id,
      modules: {
        create: [
          {
            title: 'Modelado de datos',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Tipos y relaciones en Prisma',
                  content: 'Exploremos como definir relaciones 1:N, N:N y auto-referenciadas...',
                  type: LessonType.TEXT,
                  duration: 18,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(
    `[Seed] Cursos creados: ${[reactCourse.title, nodeCourse.title, dbCourse.title].join(', ')}`,
  );
  console.log('[Seed] Listo!');
}

main()
  .catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { api } from '@/shared/lib';
import type { CourseFormData } from '../schemas/course.schema';
import type {
  CourseDetail,
  CourseStatus,
  CoursesListResponse,
  CoursesQueryParams,
} from '../types/course.types';
import { editorContentToText, lessonService } from './lessonService';
import { moduleService } from './moduleService';

type BackendCourse = {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  isPublic: boolean;
  status?: CourseStatus;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  enrollmentCount?: number;
};

type BackendCourseDetail = BackendCourse & {
  modules?: Array<{
    id: string;
    title: string;
    description?: string | null;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      content?: string | Record<string, unknown>;
      order: number;
    }>;
  }>;
};

type BackendCoursesListResponse = {
  data: BackendCourse[];
  pagination: {
    total: number;
  };
};

const stringifyLessonContent = (content?: string | Record<string, unknown>) => {
  if (!content) {
    return '';
  }

  return typeof content === 'string' ? editorContentToText(content) : editorContentToText(content);
};

const toCourseSummary = (course: BackendCourse) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  isPublic: course.isPublic,
  status: course.status ?? (course.isPublic ? 'PUBLISHED' : 'DRAFT'),
  category: course.category,
  updatedAt: course.updatedAt ?? course.createdAt ?? new Date().toISOString(),
  thumbnail: course.coverImage ?? '',
});

const toCourseDetail = (course: BackendCourseDetail): CourseDetail => ({
  ...toCourseSummary(course),
  modules:
    course.modules?.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description ?? '',
      order: module.order,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: stringifyLessonContent(lesson.content),
        order: lesson.order,
      })),
    })) ?? [],
});

const toCoursePayload = (payload: CourseFormData) => ({
  title: payload.title,
  description: payload.description,
  isPublic: payload.isPublic,
});

const createCourseStructure = async (courseId: string, payload: CourseFormData) => {
  for (const modulePayload of payload.modules) {
    const createdModule = await moduleService.createModule(courseId, {
      title: modulePayload.title,
      description: modulePayload.description,
    });

    if (!createdModule.id) {
      throw new Error('The module API did not return an id for the created module.');
    }

    for (const lessonPayload of modulePayload.lessons) {
      await lessonService.createLesson(createdModule.id, {
        title: lessonPayload.title,
        content: lessonPayload.content,
      });
    }
  }
};

const hydrateLessonContents = async (course: CourseDetail): Promise<CourseDetail> => {
  const modules = await Promise.all(
    course.modules.map(async (module) => ({
      ...module,
      lessons: await Promise.all(
        module.lessons.map(async (lesson) => {
          if (!lesson.id) {
            return lesson;
          }

          try {
            return await lessonService.getLesson(lesson.id);
          } catch {
            return lesson;
          }
        }),
      ),
    })),
  );

  return {
    ...course,
    modules,
  };
};

const toSearchParams = (params: CoursesQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.status === 'PUBLISHED') {
    searchParams.set('isPublic', 'true');
  }

  if (params.status === 'DRAFT' || params.status === 'ARCHIVED') {
    searchParams.set('isPublic', 'false');
  }

  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.pageSize ?? 10));

  return searchParams;
};

export const courseService = {
  async listCourses(params: CoursesQueryParams): Promise<CoursesListResponse> {
    const searchParams = toSearchParams(params);
    const { data } = await api.get<BackendCoursesListResponse>(`/api/courses?${searchParams.toString()}`);

    return {
      courses: data.data.map(toCourseSummary),
      total: data.pagination.total,
    };
  },

  async getCourse(courseId: string): Promise<CourseDetail> {
    const { data } = await api.get<BackendCourseDetail>(`/api/courses/${courseId}`);
    return hydrateLessonContents(toCourseDetail(data));
  },

  async createCourse(payload: CourseFormData): Promise<CourseDetail> {
    const { data } = await api.post<BackendCourseDetail>('/api/courses', toCoursePayload(payload));
    await createCourseStructure(data.id, payload);

    return this.getCourse(data.id);
  },

  async updateCourse(courseId: string, payload: CourseFormData): Promise<CourseDetail> {
    const { data } = await api.put<BackendCourseDetail>(`/api/courses/${courseId}`, toCoursePayload(payload));
    return toCourseDetail(data);
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/api/courses/${courseId}`);
  },
};

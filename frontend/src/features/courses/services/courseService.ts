import { api } from '@/shared/lib';
import type { CourseFormData } from '../schemas/course.schema';
import type {
  CourseDetail,
  CourseStatus,
  CoursesListResponse,
  CoursesQueryParams,
} from '../types/course.types';

type BackendCourse = {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  isPublic: boolean;
  status: CourseStatus;
  category?: string;
  updatedAt: string;
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
      content?: string;
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

const toCourseSummary = (course: BackendCourse) => ({
  ...course,
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
        content: lesson.content ?? '',
        order: lesson.order,
      })),
    })) ?? [],
});

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
    return toCourseDetail(data);
  },

  async createCourse(payload: CourseFormData): Promise<CourseDetail> {
    const { data } = await api.post<BackendCourseDetail>('/api/courses', payload);
    return toCourseDetail(data);
  },

  async updateCourse(courseId: string, payload: CourseFormData): Promise<CourseDetail> {
    const { data } = await api.put<BackendCourseDetail>(`/api/courses/${courseId}`, payload);
    return toCourseDetail(data);
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/api/courses/${courseId}`);
  },
};

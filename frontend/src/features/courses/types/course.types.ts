import type { CourseFormData } from '../schemas/course.schema';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isPublic: boolean;
  status: CourseStatus;
  category?: string;
  updatedAt: string;
};

export type CourseDetail = CourseSummary & CourseFormData;

export type CoursesQueryParams = {
  search?: string;
  status?: CourseStatus | 'ALL';
  page?: number;
  pageSize?: number;
};

export type CoursesListResponse = {
  courses: CourseSummary[];
  total: number;
};

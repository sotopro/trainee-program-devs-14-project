import { api } from '@/shared/lib';
import type {
  AssignableUsersQueryParams,
  AssignableUsersResponse,
  AssignmentUser,
  CourseEnrollment,
} from '../types/course-assignment.types';

type AssignCourseResponse = {
  id: string;
  userId: string;
  courseId: string;
  learningPathId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
};

const toAssignmentUser = (enrollment: CourseEnrollment): AssignmentUser => ({
  id: enrollment.user.id,
  name: enrollment.user.name,
  email: enrollment.user.email,
  role: 'STUDENT',
  assignedAt: enrollment.enrolledAt,
  enrollmentId: enrollment.id,
  enrollmentStatus: enrollment.status,
  progress: enrollment.progress,
});

type BackendAssignableUsersResponse = {
  data: AssignmentUser[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};

const toSearchParams = (params: AssignableUsersQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set('search', params.search);
  }

  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 10));

  return searchParams;
};

export const assignmentService = {
  async getAssignableUsers(courseId: string, params: AssignableUsersQueryParams): Promise<AssignableUsersResponse> {
    const searchParams = toSearchParams(params);
    const { data } = await api.get<BackendAssignableUsersResponse>(
      `/api/courses/${courseId}/assignable-users?${searchParams.toString()}`,
    );

    return {
      users: data.data,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
      limit: data.pagination.limit,
    };
  },

  async getCourseEnrollments(courseId: string): Promise<AssignmentUser[]> {
    const { data } = await api.get<CourseEnrollment[]>(`/api/courses/${courseId}/enrollments`);
    return data.map(toAssignmentUser);
  },

  async assignCourse(courseId: string, userId: string): Promise<AssignCourseResponse> {
    const { data } = await api.post<AssignCourseResponse>(`/api/courses/${courseId}/assign`, { userId });
    return data;
  },

  async unassignCourse(courseId: string, userId: string): Promise<void> {
    await api.delete(`/api/courses/${courseId}/assign/${userId}`);
  },
};

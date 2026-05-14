import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';
import type { AssignableUsersQueryParams } from '../types/course-assignment.types';

export const courseAssignmentsQueryKey = ['course-assignments'] as const;

export function useAssignableUsers(courseId: string | undefined, params: AssignableUsersQueryParams) {
  return useQuery({
    queryKey: [...courseAssignmentsQueryKey, courseId, 'assignable-users', params],
    queryFn: () => assignmentService.getAssignableUsers(courseId ?? '', params),
    enabled: Boolean(courseId),
    placeholderData: (previousData) => previousData,
  });
}

export function useCourseEnrollments(courseId?: string) {
  return useQuery({
    queryKey: [...courseAssignmentsQueryKey, courseId, 'enrollments'],
    queryFn: () => assignmentService.getCourseEnrollments(courseId ?? ''),
    enabled: Boolean(courseId),
    retry: false,
  });
}

export function useAssignCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => assignmentService.assignCourse(courseId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...courseAssignmentsQueryKey, courseId, 'enrollments'] });
      await queryClient.invalidateQueries({ queryKey: [...courseAssignmentsQueryKey, courseId, 'assignable-users'] });
    },
  });
}

export function useUnassignCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => assignmentService.unassignCourse(courseId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...courseAssignmentsQueryKey, courseId, 'enrollments'] });
      await queryClient.invalidateQueries({ queryKey: [...courseAssignmentsQueryKey, courseId, 'assignable-users'] });
    },
  });
}

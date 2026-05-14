import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lessonService';
import { coursesQueryKey } from './useCourses';

type CreateLessonPayload = {
  moduleId: string;
  title: string;
  content: string;
};

type UpdateLessonPayload = {
  lessonId: string;
  title: string;
  content: string;
};

type ReorderLessonsPayload = {
  moduleId: string;
  lessons: Array<{
    id?: string;
    order: number;
  }>;
};

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, title, content }: CreateLessonPayload) => lessonService.createLesson(moduleId, { title, content }),
    onSuccess: async (_lesson, payload) => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
      await queryClient.invalidateQueries({ queryKey: ['modules', payload.moduleId, 'lessons'] });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, title, content }: UpdateLessonPayload) => lessonService.updateLesson(lessonId, { title, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => lessonService.deleteLesson(lessonId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

export function useReorderLessons(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessons }: ReorderLessonsPayload) => lessonService.reorderLessons(lessons),
    onSuccess: async (_result, payload) => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
      await queryClient.invalidateQueries({ queryKey: ['modules', payload.moduleId, 'lessons'] });
    },
  });
}

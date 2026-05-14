import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../services/moduleService';
import { coursesQueryKey } from './useCourses';

type CreateModulePayload = {
  title: string;
  description?: string;
};

type UpdateModulePayload = {
  moduleId: string;
  title: string;
  description?: string;
};

type ReorderModulesPayload = {
  modules: Array<{
    id?: string;
    order: number;
  }>;
};

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateModulePayload) => moduleService.createModule(courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, title, description }: UpdateModulePayload) =>
      moduleService.updateModule(moduleId, { title, description }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleService.deleteModule(moduleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modules }: ReorderModulesPayload) => moduleService.reorderModules(modules),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId] });
      await queryClient.invalidateQueries({ queryKey: [...coursesQueryKey, courseId, 'modules'] });
    },
  });
}

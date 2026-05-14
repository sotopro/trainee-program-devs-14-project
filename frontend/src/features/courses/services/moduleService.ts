import { api } from '@/shared/lib';
import type { CourseDetail } from '../types/course.types';

type CourseModule = CourseDetail['modules'][number];

type BackendModule = {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  courseId: string;
  lessonCount?: number;
  createdAt?: string;
};

const toCourseModule = (module: BackendModule): CourseModule => ({
  id: module.id,
  title: module.title,
  description: module.description ?? '',
  order: module.order,
  lessons: [],
});

export const moduleService = {
  async listModules(courseId: string): Promise<CourseModule[]> {
    const { data } = await api.get<BackendModule[]>(`/api/courses/${courseId}/modules`);
    return data.map(toCourseModule);
  },

  async createModule(courseId: string, payload: Pick<CourseModule, 'title' | 'description'>): Promise<CourseModule> {
    const { data } = await api.post<BackendModule>(`/api/courses/${courseId}/modules`, {
      title: payload.title,
      description: payload.description,
    });
    return toCourseModule(data);
  },

  async updateModule(moduleId: string, payload: Pick<CourseModule, 'title' | 'description'>): Promise<CourseModule> {
    const { data } = await api.put<BackendModule>(`/api/modules/${moduleId}`, {
      title: payload.title,
      description: payload.description,
    });
    return toCourseModule(data);
  },

  async deleteModule(moduleId: string): Promise<void> {
    await api.delete(`/api/modules/${moduleId}`);
  },

  async reorderModules(modules: Array<Pick<CourseModule, 'id' | 'order'>>): Promise<void> {
    await api.patch('/api/modules/reorder', {
      modules: modules.filter((module): module is { id: string; order: number } => Boolean(module.id)),
    });
  },
};

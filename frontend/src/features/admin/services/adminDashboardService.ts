import { api } from '@/shared/lib';
import type { DashboardStatsResponse } from '../types/dashboard.types';

export const adminDashboardService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const { data } = await api.get<DashboardStatsResponse>('/api/admin/dashboard-stats');

    return {
      stats: data.stats,
      recentActivity: data.recentActivity.slice(0, 10),
    };
  },
};

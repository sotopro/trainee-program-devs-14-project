import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '../services/adminDashboardService';

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminDashboardService.getDashboardStats,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    stats: query.data?.stats,
    recentActivity: query.data?.recentActivity ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

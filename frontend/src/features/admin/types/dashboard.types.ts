export type DashboardStats = {
  totalCourses: number;
  totalUsers: number;
  activeEnrollments: number;
};

export type RecentActivityType = 'ENROLLMENT' | 'COURSE_PUBLISHED' | 'QUIZ_COMPLETED';

export type RecentActivityItem = {
  id: string;
  type: RecentActivityType;
  title: string;
  description: string;
  createdAt: string;
};

export type DashboardStatsResponse = {
  stats: DashboardStats;
  recentActivity: RecentActivityItem[];
};

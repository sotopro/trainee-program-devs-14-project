export type AssignmentUser = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'USER' | 'ADMIN';
  assignedAt?: string;
  enrollmentId?: string;
  enrollmentStatus?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress?: number;
};

export type AssignableUsersQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type AssignableUsersResponse = {
  users: AssignmentUser[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export type CourseEnrollment = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  enrolledAt: string;
};

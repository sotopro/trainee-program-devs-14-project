export type UserRole = 'ADMIN' | 'USER';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthUser = User;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RefreshSessionResponse = {
  accessToken: string;
  refreshToken: string;
};

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  age?: number | null;
  phone?: string | null;
};

export type AuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type AuthRefreshResponse = {
  accessToken: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  level?: string;
};

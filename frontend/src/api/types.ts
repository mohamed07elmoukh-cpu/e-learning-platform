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
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  level?: string | null;
  category?: string;
  estimatedHours?: number;
  thumbnailUrl?: string | null;
  tags?: string[];
  featured?: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "TEXT" | "LINK" | "QUIZ";
  durationMin?: number | null;
  isPreview?: boolean;
};

export type Module = {
  id: string;
  title: string;
  summary?: string | null;
  orderIndex: number;
  lessons: Lesson[];
};

export type CourseDetail = Course & {
  modules: Module[];
};

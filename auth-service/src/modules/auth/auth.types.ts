import { Role, User } from "@prisma/client";

export type PublicUser = Pick<User, "id" | "fullName" | "email" | "role" | "age" | "phone">;

export type JwtClaims = {
  sub: string;
  email: string;
  role: Role;
  fullName: string;
};

export type RequestMeta = {
  ip?: string | null;
  userAgent?: string | null;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

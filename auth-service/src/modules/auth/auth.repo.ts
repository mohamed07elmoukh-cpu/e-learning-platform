import { Prisma, User } from "@prisma/client";
import prisma from "../../db/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data });
}

export function updateUserLogin(id: string, ip?: string | null, userAgent?: string | null) {
  return prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      lastUserAgent: userAgent
    }
  });
}

export function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash }
  });
}

export function updateUserProfile(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data
  });
}

export function createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });
}

export function findActiveRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });
}

export function revokeRefreshToken(tokenHash: string) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export function createLoginAudit(data: {
  userId?: string | null;
  email?: string | null;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
  reason?: string | null;
}) {
  return prisma.loginAudit.create({
    data: {
      userId: data.userId ?? undefined,
      email: data.email ?? undefined,
      success: data.success,
      ip: data.ip ?? undefined,
      userAgent: data.userAgent ?? undefined,
      reason: data.reason ?? undefined
    }
  });
}

export async function seedUser(email: string, fullName: string, role: User["role"], passwordHash: string) {
  const existing = await findUserByEmail(email);
  if (existing) return false;

  await createUser({
    email,
    fullName,
    role,
    passwordHash
  });

  return true;
}

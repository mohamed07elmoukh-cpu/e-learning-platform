import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Role, User } from "@prisma/client";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";
import * as repo from "./auth.repo";
import { AuthResponse, JwtClaims, PublicUser, RequestMeta } from "./auth.types";

type HttpError = Error & { status?: number; details?: string };

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

function createError(status: number, message: string, details?: string): HttpError {
  const error = new Error(message) as HttpError;
  error.status = status;
  error.details = details;
  return error;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAge(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createError(400, "Invalid age");
  }
  return Math.floor(parsed);
}

function toPublicUser(user: Pick<User, "id" | "fullName" | "email" | "role" | "age" | "phone">): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    age: user.age ?? null,
    phone: user.phone ?? null
  };
}

function signToken(user: PublicUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function verifyAccessToken(header: string | undefined) {
  if (!header || !header.startsWith("Bearer ")) {
    throw createError(401, "Missing Authorization header");
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtClaims;
  } catch (error) {
    throw createError(401, "Invalid token", (error as Error).message);
  }
}

function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRefreshTokenValue() {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  return { token, tokenHash: hashRefreshToken(token), expiresAt };
}

function createResetToken(userId: string) {
  const token = `rt_${Math.random().toString(36).slice(2)}${Date.now()}`;
  resetTokens.set(token, { userId, expiresAt: Date.now() + 30 * 60 * 1000 });
  return token;
}

function consumeResetToken(token: string) {
  const entry = resetTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return null;
  }
  resetTokens.delete(token);
  return entry.userId;
}

async function safeAudit(data: {
  userId?: string | null;
  email?: string | null;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
  reason?: string | null;
}) {
  try {
    await repo.createLoginAudit(data);
  } catch (error) {
    logger.warn({ err: error, email: data.email, userId: data.userId }, "login audit failed");
  }
}

async function issueSession(user: PublicUser): Promise<AuthResponse> {
  const { token, tokenHash, expiresAt } = createRefreshTokenValue();
  await repo.createRefreshToken(user.id, tokenHash, expiresAt);

  return {
    user,
    accessToken: signToken(user),
    refreshToken: token
  };
}

export async function registerUser(payload: unknown) {
  const { fullName, email, password, age, phone } = (payload ?? {}) as Record<string, unknown>;
  if (!fullName || !email || !password) {
    throw createError(400, "Missing required fields");
  }

  const normalizedEmail = normalizeEmail(String(email));
  const existingUser = await repo.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw createError(409, "Email already registered");
  }

  const ageValue = parseAge(age);
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await repo.createUser({
    fullName: String(fullName),
    email: normalizedEmail,
    role: "STUDENT",
    passwordHash,
    age: ageValue,
    phone: phone ? String(phone) : null
  });

  return issueSession(toPublicUser(user));
}

export async function loginUser(payload: unknown, requestMeta: RequestMeta) {
  const { email, password } = (payload ?? {}) as Record<string, unknown>;
  if (!email || !password) {
    throw createError(400, "Missing credentials");
  }

  const normalizedEmail = normalizeEmail(String(email));
  const user = await repo.findUserByEmail(normalizedEmail);
  if (!user) {
    await safeAudit({
      email: normalizedEmail,
      success: false,
      ip: requestMeta.ip,
      userAgent: requestMeta.userAgent,
      reason: "Email not found"
    });
    throw createError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    await safeAudit({
      userId: user.id,
      email: user.email,
      success: false,
      ip: requestMeta.ip,
      userAgent: requestMeta.userAgent,
      reason: "Invalid password"
    });
    throw createError(401, "Invalid credentials");
  }

  const updatedUser = await repo.updateUserLogin(user.id, requestMeta.ip, requestMeta.userAgent);
  await safeAudit({
    userId: updatedUser.id,
    email: updatedUser.email,
    success: true,
    ip: requestMeta.ip,
    userAgent: requestMeta.userAgent
  });

  return issueSession(toPublicUser(updatedUser));
}

export async function refreshSession(payload: unknown) {
  const { refreshToken } = (payload ?? {}) as Record<string, unknown>;
  if (!refreshToken || typeof refreshToken !== "string") {
    throw createError(400, "Missing refresh token");
  }

  const storedToken = await repo.findActiveRefreshToken(hashRefreshToken(refreshToken));
  if (!storedToken || !storedToken.user) {
    throw createError(401, "Invalid refresh token");
  }

  return {
    user: toPublicUser(storedToken.user),
    accessToken: signToken(toPublicUser(storedToken.user)),
    refreshToken
  };
}

export async function logoutUser(payload: unknown) {
  const { refreshToken } = (payload ?? {}) as Record<string, unknown>;
  if (refreshToken && typeof refreshToken === "string") {
    await repo.revokeRefreshToken(hashRefreshToken(refreshToken));
  }
  return { message: "Logged out" };
}

export async function forgotPassword(payload: unknown) {
  const { email } = (payload ?? {}) as Record<string, unknown>;
  if (!email || typeof email !== "string") {
    throw createError(400, "Invalid email");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await repo.findUserByEmail(normalizedEmail);
  if (!user) {
    return { message: "If the email exists, a reset link has been sent." };
  }

  const token = createResetToken(user.id);
  return {
    message: "If the email exists, a reset link has been sent.",
    details: { token }
  };
}

export async function resetPassword(payload: unknown) {
  const { token, password } = (payload ?? {}) as Record<string, unknown>;
  if (!token || !password || typeof token !== "string" || typeof password !== "string") {
    throw createError(400, "Missing token or password");
  }

  const userId = consumeResetToken(token);
  if (!userId) {
    throw createError(400, "Invalid or expired token");
  }

  const user = await repo.findUserById(userId);
  if (!user) {
    throw createError(400, "Invalid token");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await repo.updateUserPassword(user.id, passwordHash);
  return { message: "Password updated" };
}

export async function getCurrentUser(authHeader: string | undefined) {
  const payload = verifyAccessToken(authHeader);
  const user = await repo.findUserById(payload.sub);
  if (!user) {
    throw createError(401, "Invalid token");
  }

  return { user: toPublicUser(user) };
}

export async function updateProfile(authHeader: string | undefined, payload: unknown) {
  const claims = verifyAccessToken(authHeader);
  const { age, phone, fullName } = (payload ?? {}) as Record<string, unknown>;
  const ageValue = parseAge(age);
  const existingUser = await repo.findUserById(claims.sub);
  if (!existingUser) {
    throw createError(401, "Invalid token");
  }

  const nextUser = await repo.updateUserProfile(claims.sub, {
    age: ageValue,
    phone: phone === undefined ? undefined : (phone ? String(phone) : null),
    fullName: fullName === undefined ? undefined : String(fullName)
  });

  return { user: toPublicUser(nextUser) };
}

export async function readinessCheck() {
  const prisma = (await import("../../db/prisma")).default;
  await prisma.$queryRaw`SELECT 1`;
  return { status: "ready", service: "auth-service" };
}

export async function seedDefaultUsers() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const instructorPasswordHash = await bcrypt.hash("Instructor123!", 10);

  const adminCreated = await repo.seedUser(
    normalizeEmail("admin@elearning.local"),
    "Admin",
    Role.ADMIN,
    adminPasswordHash
  );
  if (adminCreated) {
    logger.info("seeded admin user");
  }

  const instructorCreated = await repo.seedUser(
    normalizeEmail("instructor@elearning.local"),
    "Instructor",
    Role.INSTRUCTOR,
    instructorPasswordHash
  );
  if (instructorCreated) {
    logger.info("seeded instructor user");
  }
}

export function getRequestMeta(req: { headers: Record<string, unknown>; ip?: string | null }) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string" && forwarded.length > 0
      ? forwarded.split(",")[0].trim()
      : req.ip ?? null;
  const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  return { ip, userAgent };
}

export function isHttpError(error: unknown): error is HttpError {
  return typeof error === "object" && error !== null && "status" in error;
}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "./db/prisma";

dotenv.config();

const app = express();
app.use(express.json());

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const gatewayOrigin = process.env.GATEWAY_ORIGIN ?? "http://localhost:8080";
const corsOrigins = (process.env.CORS_ORIGINS ?? `${frontendOrigin},${gatewayOrigin}`)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins, credentials: true }));
app.options("*", cors({ origin: corsOrigins, credentials: true }));

const PORT = Number(process.env.PORT ?? 8081);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS ?? 7);

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  age?: number | null;
  phone?: string | null;
};

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

function toPublicUser(user: PublicUser): PublicUser {
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
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function getRequestIp(req: express.Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip ?? null;
}

function getUserAgent(req: express.Request): string | null {
  const userAgent = req.headers["user-agent"];
  return typeof userAgent === "string" ? userAgent : null;
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

function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRefreshToken() {
  const token = crypto.randomBytes(48).toString("hex");
  const days = Number.isFinite(REFRESH_EXPIRES_DAYS) && REFRESH_EXPIRES_DAYS > 0 ? REFRESH_EXPIRES_DAYS : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return { token, tokenHash: hashRefreshToken(token), expiresAt };
}

async function logLoginAudit(data: {
  userId?: string | null;
  email?: string | null;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
  reason?: string | null;
}) {
  try {
    await prisma.loginAudit.create({
      data: {
        userId: data.userId ?? undefined,
        email: data.email ?? undefined,
        success: data.success,
        ip: data.ip ?? undefined,
        userAgent: data.userAgent ?? undefined,
        reason: data.reason ?? undefined
      }
    });
  } catch (error) {
    console.warn("Login audit failed", error);
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAge(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

const registerHandler: express.RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password, age, phone } = req.body ?? {};

    const ageValue = parseAge(age);
    if (age !== undefined && age !== null && age !== "" && ageValue === null) {
      return res.status(400).json({ message: "Invalid age" });
    }
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        role: "STUDENT",
        passwordHash,
        age: ageValue,
        phone: phone ? String(phone) : null
      }
    });

    const { token, tokenHash, expiresAt } = createRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const accessToken = signToken(toPublicUser(user));
    return res.status(201).json({
      user: toPublicUser(user),
      accessToken,
      refreshToken: token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      details: (error as Error).message
    });
  }
};

const loginHandler: express.RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const ip = getRequestIp(req);
    const userAgent = getUserAgent(req);

    if (!user) {
      await logLoginAudit({
        email: normalizedEmail,
        success: false,
        ip,
        userAgent,
        reason: "Email not found"
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await logLoginAudit({
        userId: user.id,
        email: user.email,
        success: false,
        ip,
        userAgent,
        reason: "Invalid password"
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastUserAgent: userAgent
      }
    });

    await logLoginAudit({
      userId: user.id,
      email: user.email,
      success: true,
      ip,
      userAgent
    });

    const { token, tokenHash, expiresAt } = createRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const accessToken = signToken(toPublicUser(updatedUser));
    return res.json({
      user: toPublicUser(updatedUser),
      accessToken,
      refreshToken: token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      details: (error as Error).message
    });
  }
};

const refreshHandler: express.RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!storedToken || !storedToken.user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = signToken(toPublicUser(storedToken.user));
    return res.json({
      user: toPublicUser(storedToken.user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
      details: (error as Error).message
    });
  }
};

const logoutHandler: express.RequestHandler = async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  res.json({ message: "Logged out" });
};

const forgotPasswordHandler: express.RequestHandler = async (req, res) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email" });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (user) {
    const token = createResetToken(user.id);
    return res.json({
      message: "If the email exists, a reset link has been sent.",
      details: { token }
    });
  }

  return res.json({ message: "If the email exists, a reset link has been sent." });
};

const resetPasswordHandler: express.RequestHandler = async (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token || !password) {
    return res.status(400).json({ message: "Missing token or password" });
  }

  const userId = consumeResetToken(token);
  if (!userId) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  return res.json({ message: "Password updated" });
};

const meHandler: express.RequestHandler = async (req, res) => {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }
  try {
    const token = header.slice("Bearer ".length).trim();
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      details: (error as Error).message
    });
  }
};

app.post(["/register", "/auth/register"], registerHandler);
app.post(["/login", "/auth/login"], loginHandler);
app.post(["/refresh", "/auth/refresh"], refreshHandler);
app.post(["/logout", "/auth/logout"], logoutHandler);
app.get(["/me", "/auth/me"], meHandler);
app.post(["/auth/forgot-password", "/forgot-password"], forgotPasswordHandler);
app.post(["/auth/reset-password", "/reset-password"], resetPasswordHandler);

const profileHandler: express.RequestHandler = async (req, res) => {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }
  try {
    const token = header.slice("Bearer ".length).trim();
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const { age, phone, fullName } = req.body ?? {};
    const ageValue = parseAge(age);
    if (age !== undefined && age !== null && age !== "" && ageValue === null) {
      return res.status(400).json({ message: "Invalid age" });
    }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        age: ageValue,
        phone: phone === undefined ? undefined : (phone ? String(phone) : null),
        fullName: fullName === undefined ? undefined : String(fullName)
      }
    });

    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return res.status(400).json({
      message: "Profile update failed",
      details: (error as Error).message
    });
  }
};

app.put(["/profile", "/auth/profile"], profileHandler);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

async function seedUser(email: string, fullName: string, role: Role, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return false;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: normalizedEmail,
      fullName,
      role,
      passwordHash
    }
  });
  return true;
}

async function seedDefaultUsers() {
  const adminCreated = await seedUser("admin@elearning.local", "Admin", "ADMIN", "Admin123!");
  if (adminCreated) {
    console.log("Seeded admin user: admin@elearning.local");
  }
  const instructorCreated = await seedUser(
    "instructor@elearning.local",
    "Instructor",
    "INSTRUCTOR",
    "Instructor123!"
  );
  if (instructorCreated) {
    console.log("Seeded instructor user: instructor@elearning.local");
  }
}

async function start() {
  await seedDefaultUsers();
  app.listen(PORT, () => {
    console.log(`Auth service listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start auth service", error);
  process.exit(1);
});








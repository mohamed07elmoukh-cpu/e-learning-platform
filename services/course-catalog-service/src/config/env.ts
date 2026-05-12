import dotenv from "dotenv";

dotenv.config();

type Env = {
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  JWT_SECRET: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const portRaw = process.env.PORT ?? "8082";
const portNumber = Number(portRaw);
if (!Number.isFinite(portNumber)) {
  throw new Error("Invalid PORT value");
}

const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env: Env = {
  PORT: portNumber,
  DATABASE_URL: requireEnv("DATABASE_URL"),
  CORS_ORIGINS: corsOrigins,
  JWT_SECRET: requireEnv("JWT_SECRET")
};

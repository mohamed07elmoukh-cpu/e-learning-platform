import dotenv from "dotenv";

dotenv.config();

type Env = {
  PORT: number;
  FRONTEND_ORIGIN: string;
  AUTH_SERVICE_URL: string;
  COURSE_SERVICE_URL: string;
  JWT_SECRET: string;
};

function requireEnv(name: keyof Omit<Env, "PORT">): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const portRaw = process.env.PORT ?? "8080";
const portNumber = Number(portRaw);
if (!Number.isFinite(portNumber)) {
  throw new Error("Invalid PORT value");
}

export const env: Env = {
  PORT: portNumber,
  FRONTEND_ORIGIN: requireEnv("FRONTEND_ORIGIN"),
  AUTH_SERVICE_URL: requireEnv("AUTH_SERVICE_URL"),
  COURSE_SERVICE_URL: requireEnv("COURSE_SERVICE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET")
};

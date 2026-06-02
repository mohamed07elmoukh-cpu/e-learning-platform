import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";

dotenv.config();

type Env = {
  PORT: number;
  FRONTEND_ORIGIN: string;
  GATEWAY_ORIGIN: string;
  CORS_ORIGINS: string[];
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions["expiresIn"];
  REFRESH_EXPIRES_DAYS: number;
};

const port = Number(process.env.PORT ?? 8081);
if (!Number.isFinite(port)) {
  throw new Error("Invalid PORT value");
}

const refreshExpiresDays = Number(process.env.REFRESH_EXPIRES_DAYS ?? 7);
if (!Number.isFinite(refreshExpiresDays) || refreshExpiresDays <= 0) {
  throw new Error("Invalid REFRESH_EXPIRES_DAYS value");
}

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const gatewayOrigin = process.env.GATEWAY_ORIGIN ?? "http://localhost:8080";

export const env: Env = {
  PORT: port,
  FRONTEND_ORIGIN: frontendOrigin,
  GATEWAY_ORIGIN: gatewayOrigin,
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? `${frontendOrigin},${gatewayOrigin}`)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev_secret_change_me",
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"],
  REFRESH_EXPIRES_DAYS: refreshExpiresDays
};

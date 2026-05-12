import { CorsOptions } from "cors";
import { env } from "./env";

export function createCorsOptions(): CorsOptions {
  if (!env.CORS_ORIGINS.length) {
    return { origin: true, credentials: true };
  }
  return {
    origin: env.CORS_ORIGINS,
    credentials: true
  };
}

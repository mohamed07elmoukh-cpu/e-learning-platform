import { env } from "../config/env";
import { proxyFetch } from "./httpClient";

export function register(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/register`, "POST", body, headers);
}

export function login(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/login`, "POST", body, headers);
}

export function refresh(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/refresh`, "POST", body, headers);
}

export function logout(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/logout`, "POST", body, headers);
}

export function me(headers: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/me`, "GET", undefined, headers);
}

export function forgotPassword(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/forgot-password`, "POST", body, headers);
}

export function resetPassword(body: unknown, headers?: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/reset-password`, "POST", body, headers);
}

export function updateProfile(body: unknown, headers: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/profile`, "PUT", body, headers);
}

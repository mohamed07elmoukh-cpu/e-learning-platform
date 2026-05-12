import { env } from "../config/env";
import { proxyFetch } from "./httpClient";

export function register(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/register`, "POST", body);
}

export function login(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/login`, "POST", body);
}

export function refresh(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/refresh`, "POST", body);
}

export function logout(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/logout`, "POST", body);
}

export function me(headers: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/me`, "GET", undefined, headers);
}

export function forgotPassword(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/forgot-password`, "POST", body);
}

export function resetPassword(body: unknown) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/reset-password`, "POST", body);
}

export function updateProfile(body: unknown, headers: Record<string, string>) {
  return proxyFetch(`${env.AUTH_SERVICE_URL}/auth/profile`, "PUT", body, headers);
}

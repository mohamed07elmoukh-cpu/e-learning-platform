import { endpoints } from "./endpoints";
import { AuthRefreshResponse } from "./types";
import { tokenStorage } from "../auth/tokenStorage";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean; // inject access token by default
};

let refreshPromise: Promise<string | null> | null = null;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {})
  };

  if (options.auth !== false) {
    const access = tokenStorage.getAccessToken();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  // If unauthorized, attempt refresh once
  if (res.status === 401 && options.auth !== false) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      // retry once
      const retryHeaders = { ...headers, Authorization: `Bearer ${newAccess}` };
      const retryRes = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: retryHeaders,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!retryRes.ok) {
        const msg = await safeErrorMessage(retryRes);
        throw new Error(msg);
      }
      return (await retryRes.json()) as T;
    }

    tokenStorage.clear();
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!res.ok) {
    const msg = await safeErrorMessage(res);
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

async function safeErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || data?.error || `Erreur HTTP ${res.status}`;
  } catch {
    return `Erreur HTTP ${res.status}`;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const data = await request<AuthRefreshResponse>(endpoints.auth.refresh, {
        method: "POST",
        auth: false, // do not send access token
        body: { refreshToken }
      });

      tokenStorage.setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const http = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "PUT", body, auth }),
  del: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE", auth })
};

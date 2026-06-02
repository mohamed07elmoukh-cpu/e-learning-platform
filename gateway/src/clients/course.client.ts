import { env } from "../config/env";

export type ServiceUnavailableError = Error & {
  code: "SERVICE_UNAVAILABLE";
};

type ProxyResult<T> = {
  status: number;
  data: T;
};

function isServiceUnavailable(error: unknown): error is ServiceUnavailableError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as ServiceUnavailableError).code === "SERVICE_UNAVAILABLE"
  );
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
}

async function fetchJson<T>(url: string, headers: Record<string, string>, timeoutMs = 3000): Promise<ProxyResult<T>> {
  const { controller, timeout } = createTimeoutSignal(timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return { status: response.status, data: data as T };
  } catch (error) {
    if (isServiceUnavailable(error)) throw error;
    const err = new Error((error as Error).message ?? "Service unavailable") as ServiceUnavailableError;
    err.code = "SERVICE_UNAVAILABLE";
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function listCourses(headers: Record<string, string>) {
  return fetchJson(`${env.COURSE_SERVICE_URL}/catalog/courses`, headers);
}

export async function getCourseById(id: string, headers: Record<string, string>) {
  return fetchJson(`${env.COURSE_SERVICE_URL}/catalog/courses/${id}`, headers);
}

import { env } from "../config/env";

type DependencyStatus = {
  name: string;
  ok: boolean;
  status?: number;
  details?: string;
};

async function checkUrl(name: string, url: string): Promise<DependencyStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return {
      name,
      ok: response.ok,
      status: response.status,
      details: response.ok ? "ok" : `unexpected status ${response.status}`
    };
  } catch (error) {
    return {
      name,
      ok: false,
      details: (error as Error).message
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getReadinessStatus() {
  const dependencies = await Promise.all([
    checkUrl("auth-service", `${env.AUTH_SERVICE_URL}/readiness`),
    checkUrl("course-catalog-service", `${env.COURSE_SERVICE_URL}/readiness`)
  ]);

  return {
    ok: dependencies.every((dependency) => dependency.ok),
    dependencies
  };
}

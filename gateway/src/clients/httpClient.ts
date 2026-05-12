type ProxyResult<T> = {
  status: number;
  data: T;
};

export async function proxyFetch<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  headers?: Record<string, string>
): Promise<ProxyResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(headers ?? {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      data: data as T
    };
  } catch (error) {
    throw new Error(`Proxy request failed: ${(error as Error).message}`);
  }
}

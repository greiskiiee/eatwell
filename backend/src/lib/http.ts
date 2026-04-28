export type FetchJsonOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string | undefined>;
  body?: unknown;
  timeoutMs?: number;
};

export class UpstreamError extends Error {
  status: number;
  upstreamBody: unknown;
  constructor(status: number, message: string, upstreamBody: unknown) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.upstreamBody = upstreamBody;
  }
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {};
    if (options.body) headers["content-type"] = "application/json";
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        if (typeof v === "string" && v.length > 0) headers[k] = v;
      }
    }

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      // keep text
    }

    if (!res.ok) {
      throw new UpstreamError(
        res.status,
        `Upstream request failed (${res.status})`,
        parsed,
      );
    }

    return parsed as T;
  } finally {
    clearTimeout(timeout);
  }
}


const API_TIMEOUT_MS = 20000;
const API_RETRY_ATTEMPTS = 2;
const API_NO_STORE_GET_TIMEOUT_MS = 7000;
const API_NO_STORE_GET_RETRY_ATTEMPTS = 1;

type BackendApiEnvSource = "BACKEND_API_URL" | "API_URL" | "NEXT_PUBLIC_API_URL";

export type BackendApiFailureCode =
  | "missing-env"
  | "invalid-env"
  | "network"
  | "timeout"
  | "http-error"
  | "invalid-json";

type BackendApiConfig = {
  source: BackendApiEnvSource;
  rawValue: string;
  normalizedBaseUrl: string;
  url: URL;
};

export class BackendApiError extends Error {
  readonly code: BackendApiFailureCode;
  readonly endpoint: string | null;
  readonly status: number | null;
  readonly source: BackendApiEnvSource | null;

  constructor(
    message: string,
    options: {
      code: BackendApiFailureCode;
      endpoint?: string | null;
      status?: number | null;
      source?: BackendApiEnvSource | null;
    },
  ) {
    super(message);
    this.name = "BackendApiError";
    this.code = options.code;
    this.endpoint = options.endpoint ?? null;
    this.status = options.status ?? null;
    this.source = options.source ?? null;
  }
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getConfiguredBackendApiUrl(): { source: BackendApiEnvSource; value: string } | null {
  const candidates: Array<{ source: BackendApiEnvSource; value: string | undefined }> = [
    { source: "BACKEND_API_URL", value: process.env.BACKEND_API_URL },
    { source: "API_URL", value: process.env.API_URL },
    { source: "NEXT_PUBLIC_API_URL", value: process.env.NEXT_PUBLIC_API_URL },
  ];

  for (const candidate of candidates) {
    const normalized = stripWrappingQuotes(String(candidate.value ?? ""));
    if (normalized) {
      return { source: candidate.source, value: normalized };
    }
  }

  return null;
}

function getBackendApiConfigOrNull(): BackendApiConfig | null {
  const configured = getConfiguredBackendApiUrl();
  if (!configured) {
    return null;
  }

  try {
    const url = new URL(configured.value);
    const pathname = url.pathname.replace(/\/+$/, "") || "";
    const normalizedBaseUrl = `${url.origin}${pathname}`;
    return {
      source: configured.source,
      rawValue: configured.value,
      normalizedBaseUrl,
      url,
    };
  } catch {
    return null;
  }
}

function normalizeApiPath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function joinBackendApiUrl(config: BackendApiConfig, path: string): string {
  const normalizedPath = normalizeApiPath(path);
  const basePath = config.url.pathname.replace(/\/+$/, "");

  if (!basePath || basePath === "/") {
    return `${config.url.origin}${normalizedPath}`;
  }

  if (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return `${config.url.origin}${normalizedPath}`;
  }

  return `${config.url.origin}${basePath}${normalizedPath}`;
}

function getBackendApiConfigOrThrow(): BackendApiConfig {
  const configured = getConfiguredBackendApiUrl();
  if (!configured) {
    throw new BackendApiError(
      "Missing backend API URL. Set BACKEND_API_URL (preferred) or API_URL/NEXT_PUBLIC_API_URL.",
      { code: "missing-env" },
    );
  }

  try {
    const url = new URL(configured.value);
    const pathname = url.pathname.replace(/\/+$/, "") || "";
    return {
      source: configured.source,
      rawValue: configured.value,
      normalizedBaseUrl: `${url.origin}${pathname}`,
      url,
    };
  } catch {
    throw new BackendApiError(`Invalid backend API URL in ${configured.source}: ${configured.value}`, {
      code: "invalid-env",
      source: configured.source,
    });
  }
}

export function resolveBackendApiBaseUrl(): string | null {
  return getBackendApiConfigOrNull()?.normalizedBaseUrl ?? null;
}

export function hasBackendApiBaseUrl(): boolean {
  return Boolean(getBackendApiConfigOrNull());
}

export function resolveBackendApiEndpoint(path: string): string {
  const config = getBackendApiConfigOrThrow();
  return joinBackendApiUrl(config, path);
}

export async function backendApiRequestOrThrow<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getBackendApiConfigOrThrow();
  const endpoint = joinBackendApiUrl(config, path);

  const method = String(init?.method ?? "GET").toUpperCase();
  const requestCache = init?.cache ?? (method === "GET" ? "force-cache" : "no-store");
  const requestNext = init?.next ?? (requestCache === "no-store" ? { revalidate: 0 } : method === "GET" ? { revalidate: 120 } : { revalidate: 0 });
  const isFastFailRead = method === "GET" && requestCache === "no-store";
  const timeoutMs = isFastFailRead ? API_NO_STORE_GET_TIMEOUT_MS : API_TIMEOUT_MS;
  const retryAttempts = isFastFailRead ? API_NO_STORE_GET_RETRY_ATTEMPTS : API_RETRY_ATTEMPTS;

  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
        next: requestNext,
        cache: requestCache,
      });

      if (!response.ok) {
        throw new BackendApiError(`Backend API returned HTTP ${response.status} for ${endpoint}`, {
          code: "http-error",
          status: response.status,
          endpoint,
          source: config.source,
        });
      }

      try {
        return (await response.json()) as T;
      } catch {
        throw new BackendApiError(`Backend API returned invalid JSON for ${endpoint}`, {
          code: "invalid-json",
          endpoint,
          source: config.source,
        });
      }
    } catch (error) {
      if (error instanceof BackendApiError && error.code === "http-error") {
        throw error;
      }

      const isAbort = error instanceof Error && error.name === "AbortError";
      const failureCode: BackendApiFailureCode = isAbort ? "timeout" : "network";
      const canRetry = attempt < retryAttempts;

      if (!canRetry) {
        throw new BackendApiError(
          isAbort ? `Backend API request timed out for ${endpoint}` : `Backend API request failed for ${endpoint}`,
          {
            code: failureCode,
            endpoint,
            source: config.source,
          },
        );
      }

      console.warn("[backend-api] Retrying request after transient failure", {
        endpoint,
        method,
        attempt,
        nextAttempt: attempt + 1,
        reason: failureCode,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new BackendApiError(`Backend API request failed for ${endpoint}`, {
    code: "network",
    endpoint,
    source: config.source,
  });
}

export async function backendApiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return await backendApiRequestOrThrow<T>(path, init);
  } catch {
    return null;
  }
}

export async function probeBackendApiHealth(): Promise<{ ok: boolean; endpoint: string | null; status: number | null; error: string | null }> {
  let endpoint: string | null = null;
  try {
    endpoint = resolveBackendApiEndpoint("/health");
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });
    return {
      ok: response.ok,
      endpoint,
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      endpoint,
      status: null,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

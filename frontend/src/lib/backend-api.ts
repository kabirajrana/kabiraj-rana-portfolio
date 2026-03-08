const API_TIMEOUT_MS = 8000;

function getApiBaseUrl(): string | null {
  const raw = process.env.BACKEND_API_URL ?? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!raw || !raw.trim()) {
    return null;
  }

  return raw.replace(/\/$/, "");
}

export function resolveBackendApiBaseUrl(): string | null {
  return getApiBaseUrl();
}

export function hasBackendApiBaseUrl(): boolean {
  return Boolean(getApiBaseUrl());
}

export async function backendApiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      next: init?.method && init.method !== "GET" ? { revalidate: 0 } : { revalidate: 120 },
      cache: init?.method && init.method !== "GET" ? "no-store" : "force-cache",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

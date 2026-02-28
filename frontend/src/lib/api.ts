const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function getBaseUrls(): string[] {
  const urls = new Set<string>();

  if (configuredBaseUrl && configuredBaseUrl.length > 0) {
    urls.add(configuredBaseUrl);
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    urls.add(`${protocol}//${hostname}:8002`);
    urls.add(`${protocol}//${hostname}:8000`);
  }

  urls.add("http://localhost:8002");
  urls.add("http://localhost:8000");

  return Array.from(urls);
}

function normalizeErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const msg = (item as { msg?: unknown }).msg;
          return typeof msg === "string" ? msg : "";
        }
        return "";
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  if (detail && typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return "";
    }
  }

  return "";
}

export async function apiFetch(path: string, init?: RequestInit) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrls = getBaseUrls();
  let lastError: Error | null = null;

  for (let index = 0; index < baseUrls.length; index += 1) {
    const baseUrl = baseUrls[index];
    const url = `${baseUrl}${normalizedPath}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Accept: "application/json"
        }
      });

      if (response.ok) {
        return response;
      }

      if ((response.status === 404 || response.status === 405) && index < baseUrls.length - 1) {
        continue;
      }

      let detail = "";

      try {
        const data = (await response.json()) as { detail?: unknown };
        const normalized = normalizeErrorDetail(data?.detail);
        detail = normalized ? ` - ${normalized}` : "";
      } catch {
        detail = "";
      }

      throw new Error(`Request failed: ${response.status}${detail}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
    }
  }

  throw lastError ?? new Error("Request failed");
}

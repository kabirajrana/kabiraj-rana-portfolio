const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function isLocalLikeHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  if (lower === "localhost" || lower === "127.0.0.1" || lower === "::1") {
    return true;
  }

  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(lower)) {
    return true;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower)) {
    return true;
  }

  return /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(lower);
}

function getBaseUrls(): string[] {
  const urls = new Set<string>();

  if (configuredBaseUrl && configuredBaseUrl.length > 0) {
    urls.add(configuredBaseUrl);
    return Array.from(urls);
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (isLocalLikeHost(hostname)) {
      urls.add(`${protocol}//${hostname}:8002`);
      urls.add(`${protocol}//${hostname}:8000`);
      urls.add("http://localhost:8002");
      urls.add("http://localhost:8000");
    }

    return Array.from(urls);
  }

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

  if (baseUrls.length === 0) {
    throw new Error("API is not configured for production. Set NEXT_PUBLIC_API_BASE_URL in your Vercel project settings.");
  }

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

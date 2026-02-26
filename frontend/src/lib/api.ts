const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    let detail = "";

    try {
      const data = (await response.json()) as { detail?: unknown };
      const normalized = normalizeErrorDetail(data?.detail);
      detail = normalized ? ` - ${normalized}` : "";
    } catch {
      detail = "";
    }

    throw new Error(`Request failed: ${response.status}${detail}`);
  }

  return response;
}

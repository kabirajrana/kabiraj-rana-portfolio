const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
    throw new Error(`Request failed: ${response.status}`);
  }

  return response;
}

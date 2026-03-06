import { env } from "@/lib/env";

export type ContactPayload = {
	name: string;
	email: string;
	subject: string;
	message: string;
	honeypot?: string;
};

export type ContactResponse = {
	ok: boolean;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
		cache: "no-store",
	});

	if (!response.ok) {
		const data = (await response.json().catch(() => null)) as { detail?: string } | null;
		throw new Error(data?.detail ?? "Request failed");
	}

	return (await response.json()) as T;
}

export async function submitContact(payload: ContactPayload): Promise<ContactResponse> {
	return apiFetch<ContactResponse>("/contact", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

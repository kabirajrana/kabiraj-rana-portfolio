"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type MessageItem = {
  id: number;
  name: string | null;
  email: string;
  subject: string | null;
  body: string;
  created_at: string | null;
};

type MessagesResponse = {
  ok: boolean;
  count: number;
  items: MessageItem[];
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/contact/messages?limit=100");
      const data = (await response.json()) as MessagesResponse;
      setMessages(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contact Messages</h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">View user submissions saved from the contact form.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadMessages()}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm transition-all hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {loading ? <p className="text-sm text-[rgb(var(--muted))]">Loading messages...</p> : null}
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}

      {!loading && !error && messages.length === 0 ? <p className="text-sm text-[rgb(var(--muted))]">No messages yet.</p> : null}

      <div className="grid gap-3">
        {messages.map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.name || "Visitor"}</p>
              <p className="text-xs text-[rgb(var(--muted))]">
                #{item.id}
                {item.created_at ? ` • ${new Date(item.created_at).toLocaleString()}` : ""}
              </p>
            </div>
            <p className="mt-1 text-xs text-cyan-200">{item.email}</p>
            <p className="mt-2 text-xs text-[rgb(var(--muted))]">Subject: {item.subject || "(No subject)"}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[rgb(var(--muted))]">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

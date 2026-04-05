"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

import { searchAdminAction } from "@/app/(admin)/admin/actions";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const routes = [
  ["Dashboard", "/admin/dashboard"],
  ["Home", "/admin/home"],
  ["About", "/admin/about"],
  ["Projects", "/admin/projects"],
  ["Experience", "/admin/experience"],
  ["Research", "/admin/research"],
  ["Lab", "/admin/lab"],
  ["Messages", "/admin/messages"],
  ["Media", "/admin/media"],
  ["Resume", "/admin/resume"],
  ["SEO", "/admin/seo"],
  ["Analytics", "/admin/analytics"],
  ["Audit", "/admin/audit"],
  ["Health", "/admin/health"],
  ["Backup", "/admin/backup"],
  ["Settings", "/admin/settings"],
] as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<Array<{ group: string; label: string; href: string; subtitle?: string }>>([]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const items = useMemo(() => routes, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const response = await searchAdminAction(query);
        setResults(response);
      });
    }, 180);

    return () => clearTimeout(timeout);
  }, [open, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <Command className="rounded-xl border border-border bg-surface text-text">
          <Command.Input
            value={query}
            onValueChange={setQuery}
            className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none"
            placeholder="Search content and actions..."
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-3 text-sm text-muted">No results found.</Command.Empty>
            <Command.Group heading="Navigate" className="text-xs text-muted">
              {items.map(([label, href]) => (
                <Command.Item
                  key={href}
                  value={`${label} ${href}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(href);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-surface-2"
                >
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Global Search" className="text-xs text-muted">
              {results.map((item) => (
                <Command.Item
                  key={`${item.group}-${item.label}-${item.href}`}
                  value={`${item.group} ${item.label} ${item.subtitle ?? ""}`}
                  onSelect={() => {
                    setOpen(false);
                    setQuery("");
                    router.push(item.href);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-surface-2"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted">{item.subtitle ?? item.group}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
            {pending ? <p className="px-3 py-2 text-xs text-muted">Searching...</p> : null}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

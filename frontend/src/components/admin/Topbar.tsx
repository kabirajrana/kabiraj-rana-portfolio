"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Search, UserCircle2, X } from "lucide-react";

import { adminNavItems } from "@/components/admin/admin-nav-items";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Topbar({
  notifications,
}: {
  notifications: {
    unreadMessages: number;
    githubError: string | null;
    githubLastSyncAt: Date | null;
    healthSummary: string | null;
    healthWarnings: number;
    healthErrors: number;
    dueScheduled: number;
  };
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; href: string; group: string; subtitle?: string }[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const totalNotifications =
    (notifications.unreadMessages > 0 ? 1 : 0) +
    (notifications.healthErrors + notifications.healthWarnings > 0 ? 1 : 0) +
    (notifications.dueScheduled > 0 ? 1 : 0);

  useEffect(() => {
    const controller = new AbortController();

    if (query.trim().length < 2) {
      setResults([]);
      return () => controller.abort();
    }

    const timeout = setTimeout(async () => {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        items: { label: string; href: string; group: string; subtitle?: string }[];
      };
      setResults(payload.items);
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-20 mb-4 flex flex-col gap-2 border-b border-border/70 bg-background/90 py-3 backdrop-blur-xl sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="relative w-full min-w-0 max-w-none sm:max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 py-2">
        <Search className="h-4 w-4 text-muted" />
        <input
          aria-label="Search"
          placeholder="Search projects, research..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
        </div>

        {results.length ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border border-border bg-surface p-1 shadow-soft">
            {results.map((item) => (
              <Link
                key={`${item.group}-${item.label}`}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <span>{item.label}</span>
                <span className="text-xs text-muted">{item.subtitle ?? item.group}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
        <button
          type="button"
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          onClick={() => setMobileNavOpen((current) => !current)}
          className="inline-flex rounded-xl border border-border bg-surface p-2 text-muted transition-colors hover:text-text sm:hidden"
        >
          {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-xl border border-border bg-surface p-2 text-muted hover:text-text">
              <Bell className="h-4 w-4" />
              {totalNotifications > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
                  {totalNotifications}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))]">
            <DropdownMenuItem asChild>
              <Link href="/admin/messages">Unread messages: {notifications.unreadMessages}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/health">Health checks: {notifications.healthSummary ?? "Not run"}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/projects">Scheduled due soon: {notifications.dueScheduled}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="hidden rounded-xl border border-border bg-surface p-2 text-muted hover:text-text sm:inline-flex">
          <Plus className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-xl border border-border bg-surface p-2 text-muted hover:text-text">
              <UserCircle2 className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/admin/logout" className="w-full text-left">Sign out</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        id="admin-mobile-nav"
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-out ${mobileNavOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
      >
        <nav className="rounded-xl border border-border/70 bg-surface/95 p-1 backdrop-blur-xl">
          {adminNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2 hover:text-text"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

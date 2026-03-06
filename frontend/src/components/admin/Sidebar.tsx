"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCog } from "lucide-react";

import { adminNavItems } from "@/components/admin/admin-nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/80 bg-surface/70 p-4 backdrop-blur-xl lg:block">
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/70 bg-surface-2/50 p-3">
        <div className="rounded-lg bg-accent/20 p-2 text-accent">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin Control</p>
          <p className="text-xs text-muted">Portfolio OS</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {adminNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                active
                  ? "border-accent/40 bg-accent/10 text-text shadow-glow"
                  : "border-transparent text-muted hover:border-border/70 hover:bg-surface-2/50 hover:text-text",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

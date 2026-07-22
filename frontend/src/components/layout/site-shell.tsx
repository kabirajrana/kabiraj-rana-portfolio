"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main key={pathname} className="page-enter pt-24 md:pt-28">{children}</main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="pt-24 md:pt-28"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}

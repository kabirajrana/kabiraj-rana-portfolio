import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

import BackToTop from "@/components/common/BackToTop";
import ContextMenu from "@/components/ContextMenu";
import EasterEggOverlay from "@/components/EasterEggOverlay";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import { UIProvider } from "@/components/UIProvider";
import { SITE } from "@/lib/constants";
import { baseMetadata } from "@/lib/seo";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = baseMetadata({
  title: "Kabiraj Rana | AI Engineer & Production ML Architect",
  description:
    "AI engineer building scalable ML systems, LLM architectures, and intelligent AI products—delivering production-grade platforms from prototype to production.",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-full">
        <UIProvider>
          <div className="app-surface">
            <div className="app-noise" aria-hidden="true" />
            <Preloader />
            <ContextMenu />
            <EasterEggOverlay />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <BackToTop />
          </div>
        </UIProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Kabiraj Rana | AI/ML Engineer",
	description:
		"Aspiring AI/ML Engineer and full-stack developer building intelligent digital products.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className={`${inter.variable} font-sans`} suppressHydrationWarning>
				<div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-25" aria-hidden="true" />
				<SiteShell>{children}</SiteShell>
				<Toaster richColors theme="dark" />
			</body>
		</html>
	);
}

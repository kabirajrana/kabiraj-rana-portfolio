import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { PreloaderProvider } from "@/components/Preloader";
import { GlobalInteractionLayer } from "@/components/layout/global-interaction-layer";
import { SiteShell } from "@/components/layout/site-shell";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const SITE_URL = "https://www.kabirajrana.com.np";

export const metadata: Metadata = {
	title: "Kabiraj Rana | AI/ML Engineer",
	description:
		"Kabiraj Rana is an AI/ML engineer building production-grade AI systems, intelligent web applications, and applied machine learning projects.",
	metadataBase: new URL(SITE_URL),
	alternates: {
		canonical: "/",
	},
	icons: {
		icon: [
			{ url: "/Favicon/favicon.ico" },
			{ url: "/Favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/Favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/Favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
	manifest: "/Favicon/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<Script
					id="next-chunk-recovery"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `(function(){
	var KEY = 'next_chunk_recovery_attempted';
	function shouldHandleUrl(url) {
		return typeof url === 'string' && url.indexOf('/_next/static/') !== -1;
	}
	function recover() {
		try {
			if (sessionStorage.getItem(KEY)) return;
			sessionStorage.setItem(KEY, '1');
			var nextUrl = new URL(window.location.href);
			nextUrl.searchParams.set('__hard_reload', String(Date.now()));
			window.location.replace(nextUrl.toString());
		} catch (_) {
			window.location.reload();
		}
	}

	window.addEventListener('error', function(event) {
		var target = event && event.target;
		var src = target && (target.src || target.href);
		if (shouldHandleUrl(src)) recover();
	}, true);

	window.addEventListener('unhandledrejection', function(event) {
		var reason = event && event.reason;
		var message = '';
		if (typeof reason === 'string') message = reason;
		else if (reason && typeof reason.message === 'string') message = reason.message;
		if (/Loading chunk [\\w-]+ failed|ChunkLoadError|CSS_CHUNK_LOAD_FAILED/i.test(message)) recover();
	});
})();`,
					}}
				/>
			</head>
			<body className={`${inter.variable} font-sans`} suppressHydrationWarning>
				<div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-25" aria-hidden="true" />
				<PreloaderProvider>
					<SiteShell>{children}</SiteShell>
					<GlobalInteractionLayer />
				</PreloaderProvider>
				<Toaster richColors theme="dark" />
				<GoogleAnalytics gaId="G-LNGXX4LNCR" />
			</body>
		</html>
	);
}

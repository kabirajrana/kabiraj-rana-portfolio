import type { Metadata } from "next";

const SITE_URL = "https://www.kabirajrana.com.np";
const SITE_NAME = "Kabiraj Rana";

export function buildMetadata({
	title,
	description,
	path = "/",
	absoluteTitle = false,
}: {
	title: string;
	description: string;
	path?: string;
	absoluteTitle?: boolean;
}): Metadata {
	const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
	const canonical = `${SITE_URL}${path}`;

	return {
		title: fullTitle,
		description,
		metadataBase: new URL(SITE_URL),
		alternates: { canonical },
		openGraph: {
			title: fullTitle,
			description,
			url: canonical,
			siteName: SITE_NAME,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
		},
	};
}

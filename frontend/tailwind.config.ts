import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
		"./src/content/**/*.{ts,tsx}",
		"./src/lib/**/*.{ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: "1rem",
			screens: {
				"2xl": "1280px",
			},
		},
		extend: {
			colors: {
				background: "hsl(var(--background))",
				surface: "hsl(var(--surface))",
				"surface-2": "hsl(var(--surface-2))",
				border: "hsl(var(--border))",
				text: "hsl(var(--text))",
				muted: "hsl(var(--muted))",
				accent: "hsl(var(--accent))",
				"accent-2": "hsl(var(--accent-2))",
			},
			borderRadius: {
				xl: "0.9rem",
				"2xl": "1.1rem",
			},
			boxShadow: {
				glow: "0 10px 40px -18px hsl(var(--accent) / 0.45)",
				soft: "0 10px 30px -20px rgba(0,0,0,0.7)",
			},
		},
	},
	plugins: [],
};

export default config;

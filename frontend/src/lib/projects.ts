export type PortfolioProject = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  featured: boolean;
  githubUrl: string;
  liveUrl: string;
};

export const projects: PortfolioProject[] = [
  {
    slug: "dsa-visualizer",
    title: "DSA Visualizer",
    description:
      "Interactive visualizations for algorithms and data structures with clean UI and smooth animations.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    featured: true,
    githubUrl: "https://github.com/kabirajrana/DSA-Visualizer-Pro",
    liveUrl: "https://www.algovx.me/",
  },
  {
    slug: "phishing-detection",
    title: "Phishing Website Detection System",
    description:
      "AI-assisted phishing detection with URL analysis and a simple, production-style interface.",
    tags: ["Python", "FastAPI", "ML", "Streamlit"],
    featured: true,
    githubUrl: "https://github.com/kabirajrana/phishing-website-detection",
    liveUrl: "https://phishing-website-detection-kabi.streamlit.app/",
  },
];

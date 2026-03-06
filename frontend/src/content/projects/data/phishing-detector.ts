import { Project } from "@/types/project";

export const phishingDetectorProject: Project = {
	slug: "phishing-website-detection-system",
	title: "Phishing Website Detection System",
	tagline: "Machine-learning pipeline to score phishing risk in real time",
	summary:
		"An AI/ML project that classifies suspicious URLs using engineered lexical and host-based signals, exposed through a web interface for quick security checks.",
	category: "AI/ML",
	featured: true,
	year: "2026",
	role: "AI/ML Engineer",
	duration: "4 months",
	tech: ["Python", "scikit-learn", "FastAPI", "Pandas", "Next.js"],
	outcomes: [
		"Built end-to-end ML workflow from feature extraction to model serving",
		"Added explainable output signals for user trust and debugging",
		"Integrated prediction API with a modern frontend dashboard",
	],
	problem:
		"Phishing campaigns evolve quickly, and manual URL checks are slow. Users need immediate risk scoring with understandable reasoning.",
	solution:
		"Implemented a classification pipeline with preprocessing, feature engineering, model validation, and an API endpoint that returns confidence and signal highlights.",
	architecture: [
		"Data ingestion and cleaning pipeline",
		"Feature extraction for lexical and DNS attributes",
		"Model training/validation and serialized artifact storage",
		"FastAPI inference service consumed by the web client",
	],
	links: {
		github: "https://github.com/your-username/phishing-detector",
		demo: "https://demo.example.com/phishing-detector",
	},
	gallery: ["Feature dashboard", "Prediction view", "Model metrics"],
};

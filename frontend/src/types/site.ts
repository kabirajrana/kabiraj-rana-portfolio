export type NavItem = {
	label: string;
	href: string;
};

export type SocialLink = {
	label: string;
	href: string;
};

export type Skill = {
	name: string;
	level: number;
};

export type SkillGroup = {
	group: string;
	items: Skill[];
};

export type ExperienceItem = {
	title: string;
	period: string;
	organization: string;
	summary?: string;
	tags?: string[];
	bullets: string[];
	sidePlacement?: "AUTO" | "LEFT" | "RIGHT";
};

export type CertificationItem = {
	id: string;
	codeLabel?: string;
	title: string;
	href: string;
};

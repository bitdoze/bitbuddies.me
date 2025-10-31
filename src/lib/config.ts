/**
 * Site Configuration
 * Centralized configuration for site metadata, URLs, and constants
 */

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ""): string => {
	if (typeof import.meta !== "undefined" && import.meta.env) {
		return import.meta.env[key] || fallback;
	}
	return fallback;
};

// Site URLs
export const SITE_URL =
	getEnvVar("VITE_SITE_URL") ||
	(typeof window !== "undefined" ? window.location.origin : "https://bitbuddies.me");

// Site Metadata
export const SITE_CONFIG = {
	name: getEnvVar("VITE_SITE_NAME", "BitBuddies"),
	description: getEnvVar(
		"VITE_SITE_DESCRIPTION",
		"Empowering developers to build amazing things together",
	),
	url: SITE_URL,
	ogImage: `${SITE_URL}/og-image.png`,
	twitterHandle: "@bitbuddies",
	email: "hello@bitbuddies.me",
	keywords:
		"web development, AI, machine learning, React, TypeScript, courses, tutorials, workshops, programming, coding, developer community",
} as const;

// Social Links
export const SOCIAL_LINKS = {
	github: "https://github.com/bitdoze",
	twitter: "https://twitter.com/bitdoze",
	bluesky: "https://bsky.app/profile/bitdoze.com",
	youtube: "https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg",
	blog: "https://www.bitdoze.com",
	email: `mailto:${SITE_CONFIG.email}`,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
	enableDebugRoutes:
		getEnvVar("VITE_ENABLE_DEBUG_ROUTES", "false") === "true" ||
		getEnvVar("NODE_ENV") === "development",
	enableAnalytics: getEnvVar("NODE_ENV") === "production",
} as const;

// API URLs
export const API_CONFIG = {
	convex: getEnvVar("VITE_CONVEX_URL"),
	clerk: getEnvVar("VITE_CLERK_PUBLISHABLE_KEY"),
} as const;

// Theme Configuration
export const THEME_CONFIG = {
	primaryColor: "#6366f1", // Indigo
	secondaryColor: "#22d3ee", // Cyan
	darkColor: "#1e293b", // Slate
	lightColor: "#f8fafc", // Slate
} as const;

// Route Paths
export const ROUTES = {
	home: "/",
	workshops: "/workshops",
	courses: "/courses",
	community: "/community",
	blog: "/blog",
	about: "/about",
	contact: "/contact",
	privacy: "/privacy",
	terms: "/terms",
	admin: {
		workshops: "/admin/workshops",
		create: "/admin/workshops/create",
	},
	debug: {
		userSync: "/debug/user-sync",
		adminSetup: "/debug/admin-setup",
		workshopsVideo: "/debug/workshops-video",
	},
} as const;

// SEO Defaults
export const SEO_DEFAULTS = {
	titleTemplate: "%s | BitBuddies",
	defaultTitle: "BitBuddies - Learn, Build, Connect",
	defaultDescription: SITE_CONFIG.description,
	defaultKeywords: SITE_CONFIG.keywords,
	defaultOgImage: SITE_CONFIG.ogImage,
	twitterCard: "summary_large_image" as const,
	twitterHandle: SITE_CONFIG.twitterHandle,
} as const;

// Helper function to build full URLs
export const buildUrl = (path: string): string => {
	if (path.startsWith("http")) {
		return path;
	}
	return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

// Helper function to get canonical URL for current page
export const getCanonicalUrl = (path?: string): string => {
	if (path) {
		return buildUrl(path);
	}
	if (typeof window !== "undefined") {
		return window.location.href;
	}
	return SITE_URL;
};

import { Helmet } from "react-helmet-async";
import { buildUrl, getCanonicalUrl, SITE_CONFIG } from "../../lib/config";

interface SEOProps {
	title: string;
	description: string;
	keywords?: string;
	canonicalUrl?: string;
	ogImage?: string;
	ogType?: "website" | "article" | "profile";
	twitterCard?: "summary" | "summary_large_image" | "app" | "player";
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
	noIndex?: boolean;
}

export function SEO({
	title,
	description,
	keywords,
	canonicalUrl,
	ogImage,
	ogType = "website",
	twitterCard = "summary_large_image",
	author,
	publishedTime,
	modifiedTime,
	noIndex = false,
}: SEOProps) {
	const siteName = SITE_CONFIG.name;
	const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
	const defaultImage = ogImage
		? buildUrl(ogImage)
		: buildUrl("/android-chrome-512x512.png");
	const fullCanonicalUrl = canonicalUrl
		? buildUrl(canonicalUrl)
		: getCanonicalUrl();

	return (
		<Helmet>
			{/* Primary Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="title" content={fullTitle} />
			<meta name="description" content={description} />
			{keywords && <meta name="keywords" content={keywords} />}
			{author && <meta name="author" content={author} />}

			{/* Canonical URL */}
			{fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

			{/* Robots */}
			{noIndex && <meta name="robots" content="noindex, nofollow" />}

			{/* Open Graph / Facebook */}
			<meta property="og:type" content={ogType} />
			<meta property="og:url" content={fullCanonicalUrl} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={defaultImage} />
			<meta property="og:site_name" content={siteName} />
			{publishedTime && (
				<meta property="article:published_time" content={publishedTime} />
			)}
			{modifiedTime && (
				<meta property="article:modified_time" content={modifiedTime} />
			)}

			{/* Twitter */}
			<meta name="twitter:card" content={twitterCard} />
			<meta name="twitter:url" content={fullCanonicalUrl} />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={defaultImage} />
			{author && <meta name="twitter:creator" content={author} />}

			{/* Additional Meta Tags */}
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
			<meta name="language" content="English" />
		</Helmet>
	);
}

// Helper component for JSON-LD structured data
export function StructuredData({ data }: { data: Record<string, unknown> }) {
	return (
		<Helmet>
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					...data,
				})}
			</script>
		</Helmet>
	);
}

// Helper function to generate structured data
export function generateStructuredData(data: {
	type:
		| "WebSite"
		| "Organization"
		| "Course"
		| "Event"
		| "Article"
		| "BreadcrumbList";
	[key: string]: unknown;
}) {
	return <StructuredData data={data} />;
}

// Predefined SEO configurations for common pages
export const SEO_CONFIGS = {
	home: {
		title: "BitBuddies - Learn Web Development & AI",
		description:
			"Master modern web development and AI with hands-on courses, workshops, and tutorials. Join our community of developers building the future.",
		keywords:
			"web development, AI, machine learning, React, TypeScript, courses, tutorials, workshops, programming, coding, developer community",
	},
	workshops: {
		title: "Workshops",
		description:
			"Explore our collection of hands-on workshops covering web development, AI, and modern programming. Live sessions and recorded content available.",
		keywords:
			"workshops, coding workshops, web development workshops, AI workshops, live coding, programming tutorials",
	},
	courses: {
		title: "Courses",
		description:
			"Comprehensive courses to master web development, AI, and modern tech stack. Learn at your own pace with structured lessons and projects.",
		keywords:
			"online courses, web development courses, AI courses, programming courses, coding bootcamp, learn to code",
	},
	blog: {
		title: "Blog",
		description:
			"Read articles, tutorials, and insights on web development, AI, and software engineering best practices.",
		keywords:
			"blog, tech blog, programming blog, web development articles, AI articles, coding tutorials",
	},
	about: {
		title: "About Us",
		description:
			"Learn about BitBuddies mission to make quality tech education accessible to everyone. Meet our team and discover our story.",
		keywords: "about, mission, team, story, tech education, coding community",
	},
	contact: {
		title: "Contact Us",
		description:
			"Get in touch with BitBuddies. We're here to help with questions about courses, workshops, or partnerships.",
		keywords: "contact, support, help, questions, partnerships",
	},
	youtube: {
		title: "YouTube Videos",
		description:
			"Watch the latest tutorials, guides, and insights from our curated YouTube channels. Fresh content added daily covering web development, AI, and modern tech.",
		keywords:
			"youtube videos, video tutorials, coding videos, web development videos, AI videos, tech tutorials, programming videos, developer content",
	},
} as const;

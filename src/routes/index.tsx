import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	BookOpen,
	Calendar,
	Monitor,
	Rocket,
	Target,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
	generateStructuredData,
	SEO,
	SEO_CONFIGS,
} from "@/components/common/SEO";
import { CommunityBanner } from "@/components/home/CommunityBanner";
import { Hero } from "@/components/home/Hero";
import type { HighlightSection } from "@/components/home/Highlights";
import { buildContentCard, Highlights } from "@/components/home/Highlights";
import { JourneySteps } from "@/components/home/JourneySteps";

import { useCourses } from "@/hooks/useCourses";
import { usePosts } from "@/hooks/usePosts";
import { useWorkshops } from "@/hooks/useWorkshops";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type EnrichedCourse = Doc<"courses"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

type EnrichedWorkshop = Doc<"workshops"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

type EnrichedPost = Doc<"posts"> & {
	coverAsset: any;
};

type LoaderData = {
	courses: EnrichedCourse[] | null;
	workshops: EnrichedWorkshop[] | null;
	posts: EnrichedPost[] | null;
};

export const Route = createFileRoute("/")({
	loader: async () => {
		const convexUrl = import.meta.env.VITE_CONVEX_URL;
		if (!convexUrl) {
			return {
				courses: null,
				workshops: null,
				posts: null,
			} satisfies LoaderData;
		}

		try {
			const client = new ConvexHttpClient(convexUrl);
			const [courses, workshops, posts] = await Promise.all([
				client.query(api.courses.list, { limit: 3, publishedOnly: true }),
				client.query(api.workshops.list, { limit: 3, publishedOnly: true }),
				client.query(api.posts.list, { limit: 3, publishedOnly: true }),
			]);

			return { courses, workshops, posts } satisfies LoaderData;
		} catch (error) {
			console.warn("Failed to prefetch home data:", error);
			return {
				courses: null,
				workshops: null,
				posts: null,
			} satisfies LoaderData;
		}
	},
	component: HomePage,
});

function HomePage() {
	const loaderData = Route.useLoaderData() as LoaderData;
	const clientCourses = useCourses({ publishedOnly: true, limit: 3 }) as
		| EnrichedCourse[]
		| undefined;
	const clientWorkshops = useWorkshops({ publishedOnly: true, limit: 3 }) as
		| EnrichedWorkshop[]
		| undefined;
	const clientPosts = usePosts({ publishedOnly: true, limit: 3 }) as
		| EnrichedPost[]
		| undefined;

	const courses = loaderData.courses ?? clientCourses ?? [];
	const workshops = loaderData.workshops ?? clientWorkshops ?? [];
	const posts = loaderData.posts ?? clientPosts ?? [];

	const heroStats = useMemo(
		() => [
			{
				label: "Community",
				value: "8k+ members",
				icon: <Users className="h-4 w-4" />,
			},
			{
				label: "Hands-on lessons",
				value: "120+ modules",
				icon: <Monitor className="h-4 w-4" />,
			},
			{
				label: "Live sessions",
				value: "40 monthly",
				icon: <Calendar className="h-4 w-4" />,
			},
			{
				label: "Launch success",
				value: "250+ shipped",
				icon: <Rocket className="h-4 w-4" />,
			},
		],
		[],
	);

	const highlightSections = useMemo<HighlightSection[]>(() => {
		const renderCover = (url?: string | null, alt?: string) =>
			url ? (
				<div className="relative aspect-[16/9] overflow-hidden">
					<img
						src={url}
						alt={alt ?? ""}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</div>
			) : (
				<div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 to-primary/5" />
			);

		const sections: HighlightSection[] = [];

		if (courses.length > 0) {
			sections.push({
				id: "courses",
				eyebrow: "Courses",
				title: "Choose a guided learning path",
				description:
					"Structured learning modules with projects, assessments, and mentor feedback.",
				viewAllLink: "/courses",
				viewAllText: "View all courses",
				items: courses.map((course) => {
					const badges: Array<{
						label: string;
						variant?: "default" | "secondary" | "outline" | "destructive";
					}> = [{ label: course.level, variant: "secondary" }];
					if (course.accessLevel === "subscription") {
						badges.push({ label: "Premium", variant: "default" });
					}

					const meta: Array<{ icon: ReactNode; label: string }> = [];
					if (course.duration) {
						meta.push({
							icon: <BookOpen className="h-3.5 w-3.5" />,
							label: `${course.duration} mins`,
						});
					}
					if (course.enrollmentCount) {
						meta.push({
							icon: <Users className="h-3.5 w-3.5" />,
							label: `${course.enrollmentCount} students`,
						});
					}

					return {
						id: course._id,
						link: (
							<Link
								to="/courses/$slug"
								params={{ slug: course.slug }}
								className="block"
							>
								{buildContentCard({
									cover: renderCover(course.coverAsset?.url, course.title),
									title: course.title,
									description: course.shortDescription ?? course.description,
									badges,
									meta,
								})}
							</Link>
						),
					};
				}),
			});
		}

		if (workshops.length > 0) {
			sections.push({
				id: "workshops",
				eyebrow: "Workshops",
				title: "Join the next live build",
				description:
					"Interactive sessions with live Q&A, recordings, and actionable resources.",
				viewAllLink: "/workshops",
				viewAllText: "View all workshops",
				items: workshops.map((workshop) => {
					const badges: Array<{
						label: string;
						variant?: "default" | "secondary" | "outline" | "destructive";
					}> = [{ label: workshop.level, variant: "secondary" }];
					if (workshop.isLive) {
						badges.push({ label: "Live", variant: "destructive" });
					}
					if (workshop.isFeatured) {
						badges.push({ label: "Featured", variant: "outline" });
					}

					const meta: Array<{ icon: ReactNode; label: string }> = [];
					if (workshop.startDate) {
						meta.push({
							icon: <Calendar className="h-3.5 w-3.5" />,
							label: new Date(workshop.startDate).toLocaleDateString(),
						});
					}
					if (workshop.duration) {
						meta.push({
							icon: <Target className="h-3.5 w-3.5" />,
							label: `${workshop.duration} mins`,
						});
					}

					return {
						id: workshop._id,
						link: (
							<Link
								to="/workshops/$slug"
								params={{ slug: workshop.slug }}
								className="block"
							>
								{buildContentCard({
									cover: renderCover(workshop.coverAsset?.url, workshop.title),
									title: workshop.title,
									description:
										workshop.shortDescription ?? workshop.description,
									badges,
									meta,
								})}
							</Link>
						),
					};
				}),
			});
		}

		if (posts.length > 0) {
			sections.push({
				id: "posts",
				eyebrow: "Blog",
				title: "Fresh ideas from the crew",
				description:
					"Guides, breakdowns, and playbooks to help you learn faster.",
				viewAllLink: "/posts",
				viewAllText: "View all posts",
				items: posts.map((post) => {
					const badges: Array<{
						label: string;
						variant?: "default" | "secondary" | "outline" | "destructive";
					}> = [];
					if (post.category) {
						badges.push({ label: post.category, variant: "secondary" });
					}

					const meta: Array<{ icon: ReactNode; label: string }> = [];
					if (post.publishedAt) {
						meta.push({
							icon: <Calendar className="h-3.5 w-3.5" />,
							label: new Date(post.publishedAt).toLocaleDateString(),
						});
					}
					if (post.readTime) {
						meta.push({
							icon: <BookOpen className="h-3.5 w-3.5" />,
							label: `${post.readTime} min read`,
						});
					}

					return {
						id: post._id,
						link: (
							<Link
								to="/posts/$slug"
								params={{ slug: post.slug }}
								className="block"
							>
								{buildContentCard({
									cover: renderCover(post.coverAsset?.url, post.title),
									title: post.title,
									description: post.excerpt ?? post.metaDescription,
									badges,
									meta,
								})}
							</Link>
						),
					};
				}),
			});
		}

		return sections;
	}, [courses, workshops, posts]);

	const communitySectionId = "community";

	return (
		<>
			<SEO
				title={SEO_CONFIGS.home.title}
				description={SEO_CONFIGS.home.description}
				keywords={SEO_CONFIGS.home.keywords}
				canonicalUrl="/"
				ogType="website"
			/>
			{generateStructuredData({
				type: "WebSite",
				name: "BitBuddies",
				url: typeof window !== "undefined" ? window.location.origin : "",
				description: SEO_CONFIGS.home.description,
				potentialAction: {
					"@type": "SearchAction",
					target: {
						"@type": "EntryPoint",
						urlTemplate:
							typeof window !== "undefined"
								? `${window.location.origin}/search?q={search_term_string}`
								: "",
					},
					"query-input": "required name=search_term_string",
				},
			})}
			{generateStructuredData({
				type: "Organization",
				name: "BitBuddies",
				url: typeof window !== "undefined" ? window.location.origin : "",
				logo:
					typeof window !== "undefined"
						? `${window.location.origin}/logo.png`
						: "",
				description: "Empowering developers to build amazing things together",
				sameAs: [],
			})}
			<main className="flex flex-col">
				<Hero stats={heroStats} secondaryHref={`#${communitySectionId}`} />
				{highlightSections.length > 0 ? (
					<div className="section-spacing bg-background" id="highlights">
						<div className="container space-y-24">
							<Highlights sections={highlightSections} />
						</div>
					</div>
				) : null}
				<JourneySteps
					steps={[
						{
							step: "Step 01",
							title: "Assess your baseline",
							description:
								"Pick a path and get tailored recommendations based on your goals.",
						},
						{
							step: "Step 02",
							title: "Build with support",
							description:
								"Follow expert-led sessions, attend office hours, and ship real projects.",
						},
						{
							step: "Step 03",
							title: "Showcase & grow",
							description:
								"Publish your builds, receive reviews, and unlock advanced mentorship.",
						},
					]}
				/>
				<CommunityBanner sectionId={communitySectionId} />
			</main>
		</>
	);
}

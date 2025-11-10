import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	ArrowRight,
	BookOpen,
	GraduationCap,
	MessageSquare,
	Rocket,
	Sparkles,
	Users,
	Wrench,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import {
	generateStructuredData,
	SEO,
	SEO_CONFIGS,
} from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Hero } from "@/components/home/Hero";
import type { HighlightSection } from "@/components/home/Highlights";
import { Highlights } from "@/components/home/Highlights";
import { CourseCard } from "@/components/home/CourseCard";
import { WorkshopCard } from "@/components/home/WorkshopCard";
import { BlogPostCard } from "@/components/home/BlogPostCard";
import { VideoCard } from "@/components/home/VideoCard";
import { ToolCard } from "@/components/home/ToolCard";

import { useCourses } from "@/hooks/useCourses";
import { usePosts } from "@/hooks/usePosts";
import { useWorkshops } from "@/hooks/useWorkshops";
import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";
import { TOOL_REGISTRY } from "@/lib/ai-tools";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

type HighlightVideo = Doc<"youtubeVideos">;

type LoaderData = {
	courses: EnrichedCourse[] | null;
	workshops: EnrichedWorkshop[] | null;
	posts: EnrichedPost[] | null;
	videos: HighlightVideo[] | null;
};

const highlightsSectionId = "highlights";
const offeringsSectionId = "why-bitbuddies";

const supportHighlights = [
	{
		title: "Hands-on Curriculum",
		description:
			"Guided paths, checkpoints, and templates that help you actually ship your skills.",
		stat: "30+ modules",
		icon: <GraduationCap className="h-6 w-6" />,
		color: "violet",
	},
	{
		title: "Office Hours & Reviews",
		description:
			"Drop into calm sessions for live Q&A, async critiques, and community debugging.",
		stat: "Weekly support",
		icon: <MessageSquare className="h-6 w-6" />,
		color: "sky",
	},
	{
		title: "AI-Powered Tools",
		description:
			"Automate the boring parts with our growing library of AI workflows and generators.",
		stat: "12+ workflows",
		icon: <Sparkles className="h-6 w-6" />,
		color: "amber",
	},
	{
		title: "Launch Accountability",
		description:
			"Track progress, share demos, and get signal-based feedback before every release.",
		stat: "25+ launches",
		icon: <Rocket className="h-6 w-6" />,
		color: "emerald",
	},
];

const quickLinks = [
	{
		title: "Start Learning",
		description: "Browse our curated courses and workshops",
		icon: <BookOpen className="h-5 w-5" />,
		href: "/courses",
		color: "bg-violet-500",
	},
	{
		title: "Join Community",
		description: "Connect with fellow developers",
		icon: <Users className="h-5 w-5" />,
		href: "#community",
		color: "bg-sky-500",
	},
	{
		title: "Explore Tools",
		description: "AI-powered development workflows",
		icon: <Wrench className="h-5 w-5" />,
		href: "/tools",
		color: "bg-amber-500",
	},
];

export const Route = createFileRoute("/")({
	loader: async () => {
		const convexUrl = import.meta.env.VITE_CONVEX_URL;
		if (!convexUrl) {
			return {
				courses: null,
				workshops: null,
				posts: null,
				videos: null,
			} satisfies LoaderData;
		}

		try {
			const client = new ConvexHttpClient(convexUrl);
			const [courses, workshops, posts, videoResult] = await Promise.all([
				client.query(api.courses.list, { limit: 3, publishedOnly: true }),
				client.query(api.workshops.list, { limit: 3, publishedOnly: true }),
				client.query(api.posts.list, { limit: 3, publishedOnly: true }),
				client.query(api.youtubeVideos.list, { limit: 3 }),
			]);

			return {
				courses,
				workshops,
				posts,
				videos: videoResult?.videos ?? null,
			} satisfies LoaderData;
		} catch (error) {
			console.warn("Failed to prefetch home data:", error);
			return {
				courses: null,
				workshops: null,
				posts: null,
				videos: null,
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
	const clientPosts = usePosts({ publishedOnly: true, limit: 3 });
	const clientVideosData = useYoutubeVideos({ limit: 3 });

	const courses = loaderData.courses ?? clientCourses ?? [];
	const workshops = loaderData.workshops ?? clientWorkshops ?? [];
	const posts = (loaderData.posts ?? clientPosts ?? []) as EnrichedPost[];
	const videos = loaderData.videos ?? clientVideosData?.videos ?? [];

	const highlightSections = useMemo<HighlightSection[]>(() => {
		const sections: HighlightSection[] = [];

		if (courses.length > 0) {
			sections.push({
				id: "courses",
				tone: "violet",
				eyebrow: "Courses",
				title: "Guided paths built for shippers",
				description:
					"Mix fundamentals with action items, project briefs, and feedback loops.",
				viewAllLink: "/courses",
				viewAllText: "Browse all courses",
				items: courses.map((course) => ({
					id: course._id,
					card: <CourseCard course={course} />,
				})),
			});
		}

		if (workshops.length > 0) {
			sections.push({
				id: "workshops",
				tone: "sky",
				eyebrow: "Workshops",
				title: "Live labs with recordings and support",
				description:
					"Cameras on or off—join the build, ask questions, and collect the replays.",
				viewAllLink: "/workshops",
				viewAllText: "See all workshops",
				items: workshops.map((workshop) => ({
					id: workshop._id,
					card: <WorkshopCard workshop={workshop} />,
				})),
			});
		}

		if (posts.length > 0) {
			sections.push({
				id: "posts",
				tone: "slate",
				eyebrow: "Blog",
				title: "Opinionated playbooks & deep dives",
				description:
					"Break down product launches, marketing experiments, and infrastructure wins.",
				viewAllLink: "/posts",
				viewAllText: "Read the blog",
				items: posts.map((post) => ({
					id: post._id,
					card: <BlogPostCard post={post} />,
				})),
			});
		}

		if (videos.length > 0) {
			sections.push({
				id: "videos",
				tone: "emerald",
				eyebrow: "Videos",
				title: "Grab a play-by-play between meetings",
				description:
					"Daily clips on deployment, AI workflows, and indie SaaS learnings.",
				viewAllLink: "/youtube",
				viewAllText: "Watch more videos",
				items: videos.slice(0, 3).map((video) => ({
					id: video._id,
					card: <VideoCard video={video} />,
				})),
			});
		}

		const featuredTools = TOOL_REGISTRY.slice(0, 3);
		if (featuredTools.length > 0) {
			sections.push({
				id: "tools",
				tone: "amber",
				eyebrow: "Tools",
				title: "AI shortcuts for your build pipeline",
				description:
					"Drop prompts, export scripts, and collaborate on repeatable workflows.",
				viewAllLink: "/tools",
				viewAllText: "Explore all tools",
				items: featuredTools.map((tool) => ({
					id: tool.slug,
					card: <ToolCard tool={tool} />,
				})),
			});
		}

		return sections;
	}, [courses, workshops, posts, videos]);

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
				{/* Hero Section */}
				<Hero secondaryHref={`#${highlightsSectionId}`} />

				{/* Quick Links Section */}
				<section className="relative py-12 bg-linear-to-b from-background via-muted/30 to-background">
					<div className="container">
						<div className="grid gap-4 md:grid-cols-3">
							{quickLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="group"
								>
									<Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 bg-card/80 backdrop-blur-sm">
										<CardContent className="flex items-start gap-4 p-6">
											<div className={cn(
												"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
												link.color
											)}>
												{link.icon}
											</div>
											<div className="flex-1 space-y-1">
												<h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
													{link.title}
												</h3>
												<p className="text-sm text-muted-foreground">
													{link.description}
												</p>
											</div>
											<ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* Content Highlights - Courses, Workshops, Blog, Videos, Tools */}
				{highlightSections.length > 0 ? (
					<div
						className="section-spacing bg-background"
						id={highlightsSectionId}
					>
						<div className="container space-y-24">
							<Highlights sections={highlightSections} />
						</div>
					</div>
				) : null}

				{/* Why BitBuddies Section */}
				<section
					id={offeringsSectionId}
					className="section-spacing relative overflow-hidden bg-linear-to-b from-background via-primary/5 to-background"
				>
					{/* Decorative elements */}
					<div className="absolute inset-0 opacity-20">
						<div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
						<div className="absolute left-0 bottom-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
					</div>

					<div className="container relative space-y-12">
						<SectionHeader
							align="center"
							eyebrow="Why BitBuddies"
							title="A calmer way to level up"
							description="Everything lives in one stack—courses, workshops, tools, and a community that answers within minutes."
							icon={<Zap className="h-5 w-5" />}
						/>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{supportHighlights.map((value, index) => {
								const colorClasses = {
									violet: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
									sky: "from-sky-500/10 to-cyan-500/5 border-sky-500/20",
									amber: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
									emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
								};

								const iconColorClasses = {
									violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/30",
									sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-sky-500/30",
									amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30",
									emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30",
								};

								return (
									<div
										key={value.title}
										className={cn(
											"group relative rounded-2xl border bg-linear-to-br p-6 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
											colorClasses[value.color as keyof typeof colorClasses]
										)}
										style={{
											animationDelay: `${index * 100}ms`,
										}}
									>
										<div className="space-y-4">
											<div className="flex items-start justify-between gap-3">
												<span className={cn(
													"flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110",
													iconColorClasses[value.color as keyof typeof iconColorClasses]
												)}>
													{value.icon}
												</span>
												<div className="rounded-lg bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
													{value.stat}
												</div>
											</div>
											<div className="space-y-2">
												<h3 className="text-lg font-bold text-foreground">
													{value.title}
												</h3>
												<p className="text-sm leading-relaxed text-muted-foreground/90">
													{value.description}
												</p>
											</div>
										</div>

										{/* Hover gradient effect */}
										<div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									</div>
								);
							})}
						</div>
					</div>
				</section>
			</main>
		</>
	);
}

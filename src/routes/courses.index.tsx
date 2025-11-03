import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	ArrowRight,
	BookOpen,
	Clock,
	GraduationCap,
	Sparkles,
	Star,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { generateStructuredData, SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatBadge } from "@/components/common/StatBadge";
import { ContentCard } from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type EnrichedCourse = Doc<"courses"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

export const Route = createFileRoute("/courses/" as any)({
	component: CoursesPage,
	loader: async () => {
		// Prefetch courses data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { courses: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const courses = await client.query(api.courses.list, {
				publishedOnly: true,
			});
			return { courses };
		} catch (error) {
			console.error("Failed to prefetch courses:", error);
			return { courses: null };
		}
	},
});

function CoursesPage() {
	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientCourses = useCourses({ publishedOnly: true });
	const { isAuthenticated } = useAuth();

	// Prefer loader data, fallback to client fetch
	const courses = ((loaderData as any)?.courses ?? clientCourses) as
		| EnrichedCourse[]
		| null
		| undefined;

	if (courses === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	const featuredCourses = courses?.filter((course) => course.isFeatured) ?? [];
	const regularCourses = courses?.filter((course) => !course.isFeatured) ?? [];

	const siteOrigin =
		typeof window !== "undefined" ? window.location.origin : "";
	const heroStats = [
		{
			label: "Course tracks",
			value: `${courses?.length ?? 0}+`,
			icon: <GraduationCap className="h-4 w-4" />,
		},
		{
			label: "Guided lessons",
			value: "200+",
			icon: <Sparkles className="h-4 w-4" />,
		},
		{
			label: "Learners enrolled",
			value: "8k+",
			icon: <Users className="h-4 w-4" />,
		},
	];

	const renderCourseCard = (course: EnrichedCourse) => {
		const requiresAuth = course.accessLevel !== "public";
		const badges = [
			course.level
				? { label: course.level, variant: "secondary" as const }
				: undefined,
			course.accessLevel === "subscription"
				? { label: "Premium", variant: "default" as const }
				: undefined,
			!isAuthenticated && requiresAuth
				? {
						label:
							course.accessLevel === "subscription"
								? "Subscription required"
								: "Login required",
						variant: "outline" as const,
					}
				: undefined,
		].filter(Boolean) as Array<{
			label: string;
			variant?: "default" | "secondary" | "outline" | "destructive";
		}>;

		const meta = [
			course.duration
				? {
						icon: <Clock className="h-3.5 w-3.5" />,
						label: `${course.duration} minutes`,
					}
				: null,
			course.enrollmentCount
				? {
						icon: <Users className="h-3.5 w-3.5" />,
						label: `${course.enrollmentCount} enrolled`,
					}
				: null,
		].filter(Boolean) as Array<{ icon: ReactNode; label: string }>;

		const actionVariant =
			!requiresAuth || isAuthenticated ? "default" : "outline";
		const actionLabel =
			!requiresAuth || isAuthenticated ? "View course" : "Preview course";

		return (
			<ContentCard
				key={course._id}
				className="group"
				cover={
					course.coverAsset?.url ? (
						<div className="relative aspect-[16/9] overflow-hidden">
							<img
								src={course.coverAsset.url}
								alt={course.title}
								className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
							/>
						</div>
					) : (
						<div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 to-primary/5" />
					)
				}
				title={course.title}
				description={course.shortDescription ?? course.description}
				badges={badges}
				meta={meta}
				footer={
					<Button
						asChild
						variant={actionVariant}
						className="w-full justify-center gap-2"
					>
						<Link to="/courses/$slug" params={{ slug: course.slug }}>
							{actionLabel}
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				}
			/>
		);
	};

	return (
		<>
			<SEO
				title="Courses - Learn Web Development | BitBuddies"
				description="Comprehensive online courses to master web development, programming, and modern technologies. Learn at your own pace with hands-on projects."
				keywords="online courses, web development, programming courses, learn coding, video tutorials"
				canonicalUrl="/courses"
				ogType="website"
			/>
			{generateStructuredData({
				type: "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: siteOrigin,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Courses",
						item: siteOrigin ? `${siteOrigin}/courses` : "",
					},
				],
			})}
			<div className="section-spacing relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
				<div className="container grid gap-10 md:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)] md:items-center">
					<div className="space-y-8">
						<SectionHeader
							eyebrow="Guided learning paths"
							title="Master new skills with project-based courses"
							description="Follow structured, hands-on curriculums designed by mentors and industry experts. Build real-world projects while learning at your own pace."
							icon={<GraduationCap className="h-4 w-4" />}
						/>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild size="lg" className="gap-2">
								<Link to="/courses">
									Explore courses
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link to="/workshops">
									Browse workshops
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
					<div className="grid gap-4">
						{heroStats.map((stat) => (
							<StatBadge
								key={stat.label}
								label={stat.label}
								value={stat.value}
								icon={stat.icon}
							/>
						))}
					</div>
				</div>
				<div
					className="pointer-events-none absolute -right-40 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -left-32 bottom-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
					aria-hidden="true"
				/>
			</div>

			<div className="section-spacing">
				<div className="container space-y-16">
					{featuredCourses.length > 0 ? (
						<div className="space-y-8">
							<SectionHeader
								eyebrow="Standout picks"
								title="Featured courses"
								description="Curated programs that learners love right now."
								icon={<Star className="h-4 w-4" />}
							/>
							<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
								{featuredCourses.map(renderCourseCard)}
							</div>
						</div>
					) : null}
					<div className="space-y-8">
						<SectionHeader
							eyebrow={featuredCourses.length ? "Every path" : "Start learning"}
							title={
								featuredCourses.length ? "All courses" : "Available courses"
							}
							description="Choose the experience that matches your goals—every course blends guided lessons with community feedback."
							icon={<BookOpen className="h-4 w-4" />}
						/>
						{regularCourses.length === 0 && featuredCourses.length === 0 ? (
							<div className="surface-muted mx-auto max-w-2xl space-y-3 p-10 text-center">
								<BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
								<h3 className="text-xl font-semibold">No courses yet</h3>
								<p className="text-sm text-muted-foreground">
									We’re crafting the first curriculum. Join the newsletter to be
									notified when it launches.
								</p>
							</div>
						) : regularCourses.length === 0 ? (
							<div className="surface-muted mx-auto max-w-2xl p-8 text-center">
								<p className="text-sm text-muted-foreground">
									All available courses are featured above.
								</p>
							</div>
						) : (
							<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
								{regularCourses.map(renderCourseCard)}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

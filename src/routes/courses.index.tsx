import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	BookOpen,
	Clock,
	GraduationCap,
	ImageIcon,
	Lock,
	Sparkles,
	Users,
} from "lucide-react";
import {
	generateStructuredData,
	SEO,
} from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useCourses } from "../hooks/useCourses";
import { ConvexHttpClient } from "convex/browser";
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
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
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

	// Prefer loader data, fallback to client fetch
	const courses = ((loaderData as any)?.courses ?? clientCourses) as EnrichedCourse[] | null | undefined;

	if (courses === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	const featuredCourses = courses?.filter((c: EnrichedCourse) => c.isFeatured) || [];
	const regularCourses = courses?.filter((c: EnrichedCourse) => !c.isFeatured) || [];

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
						item: typeof window !== "undefined" ? window.location.origin : "",
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Courses",
						item:
							typeof window !== "undefined"
								? `${window.location.origin}/courses`
								: "",
					},
				],
			})}
			<div className="w-full">
				{/* Hero Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-4xl text-center">
							<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
								<GraduationCap className="h-12 w-12 text-primary" />
							</div>
							<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
								Master New{" "}
								<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									Skills
								</span>
							</h1>
							<p className="text-xl text-muted-foreground md:text-2xl">
								Comprehensive courses designed to take you from beginner to expert
								with structured lessons and hands-on projects
							</p>
						</div>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Featured Courses */}
				{featuredCourses.length > 0 && (
					<section className="py-16 md:py-24">
						<div className="container mx-auto px-4">
							<div className="mb-12 flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2 text-primary">
									<Sparkles className="h-6 w-6" />
								</div>
								<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
									Featured Courses
								</h2>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{featuredCourses.map((course) => (
									<CourseCard key={course._id} course={course} />
								))}
							</div>
						</div>
					</section>
				)}

				{/* All Courses */}
				<section className={`py-16 md:py-24 ${featuredCourses.length > 0 ? 'bg-muted/30' : ''}`}>
					<div className="container mx-auto px-4">
						<h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
							{featuredCourses.length > 0
								? "All Courses"
								: "Available Courses"}
						</h2>
						{regularCourses.length === 0 && featuredCourses.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
									<div className="mb-4 inline-flex rounded-full bg-muted p-4">
										<BookOpen className="h-12 w-12 text-muted-foreground" />
									</div>
									<h3 className="mb-2 text-xl font-semibold">
										No Courses Yet
									</h3>
									<p className="text-muted-foreground">
										Check back soon for new courses!
									</p>
								</div>
							</div>
						) : regularCourses.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-border bg-card p-8 text-center shadow-md">
									<p className="text-muted-foreground">
										All available courses are featured above.
									</p>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{regularCourses.map((course) => (
									<CourseCard key={course._id} course={course} />
								))}
							</div>
						)}
					</div>
				</section>
			</div>
		</>
	);
}

function CourseCard({ course }: { course: EnrichedCourse }) {
	const { isAuthenticated } = useAuth();
	const requiresAuth = course.accessLevel !== "public";

	return (
		<div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-xl hover:border-primary/50">
			{/* Cover Image with 16:9 aspect ratio */}
			<div className="relative overflow-hidden">
				{course.coverAsset?.url ? (
					<div className="w-full relative" style={{ paddingBottom: "56.25%" }}>
						<img
							src={course.coverAsset.url}
							alt={course.title}
							className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				) : (
					<div
						className="w-full relative bg-muted"
						style={{ paddingBottom: "56.25%" }}
					>
						<div className="absolute inset-0 flex items-center justify-center">
							<ImageIcon className="h-12 w-12 text-muted-foreground" />
						</div>
					</div>
				)}
			</div>
			<div className="flex flex-col flex-1 p-6">
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="shadow-sm">{course.level}</Badge>
						{requiresAuth && !isAuthenticated && (
							<Badge variant="secondary" className="gap-1">
								<Lock className="h-3 w-3" />
								Login Required
							</Badge>
						)}
						{course.accessLevel === "subscription" && (
							<Badge variant="default" className="gap-1">
								Premium
							</Badge>
						)}
					</div>
				</div>
				<h3 className="text-xl font-semibold line-clamp-2 mb-2">{course.title}</h3>
				{course.shortDescription && (
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
						{course.shortDescription}
					</p>
				)}
			</div>
			<div className="flex-1 px-6">
				<p className="text-sm text-muted-foreground line-clamp-3">
					{course.description}
				</p>
				<div className="mt-4 space-y-2">
					{course.duration && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="rounded bg-muted p-1">
								<Clock className="h-4 w-4" />
							</div>
							<span>{course.duration} minutes</span>
						</div>
					)}
					{course.enrollmentCount > 0 && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="rounded bg-muted p-1">
								<Users className="h-4 w-4" />
							</div>
							<span>{course.enrollmentCount} students enrolled</span>
						</div>
					)}
				</div>
				{course.tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-4">
						{course.tags.slice(0, 3).map((tag: string) => (
							<span
								key={tag}
								className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground font-medium"
							>
								#{tag}
							</span>
						))}
						{course.tags.length > 3 && (
							<span className="text-xs px-2 py-1 text-muted-foreground">
								+{course.tags.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
			<div className="p-6 pt-0 mt-auto">
				{isAuthenticated || !requiresAuth ? (
					<Button asChild className="w-full shadow-sm">
						<a href={`/courses/${course.slug}`}>
							View Course
							<ArrowRight className="ml-2 h-4 w-4" />
						</a>
					</Button>
				) : (
					<Button asChild className="w-full shadow-sm" variant="outline">
						<a href={`/courses/${course.slug}`}>
							<Lock className="mr-2 h-4 w-4" />
							Sign In to View
						</a>
					</Button>
				)}
			</div>
		</div>
	);
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	ArrowLeft,
	Award,
	BookOpen,
	Calendar,
	Clock,
	FileText,
	Users,
} from "lucide-react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { generateStructuredData, SEO } from "../components/common/SEO";
import { SectionHeader } from "../components/common/SectionHeader";
import {
	ContentDetailLayout,
	ContentDetailHeader,
	ContentDetailCover,
	MetaInfoCard,
	AuthRequiredCard,
	TopicsTags,
	CourseProgress,
	CourseCurriculum,
} from "../components/content";
import type { MetaItem } from "../components/content";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useChaptersByCourse } from "../hooks/useChapters";
import { useCourseBySlug } from "../hooks/useCourses";
import { useLessonsByCourse } from "../hooks/useLessons";
import { useEnrollment, useUserCourseProgress } from "../hooks/useProgress";

type EnrichedCourse = Doc<"courses"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

type LessonDoc = Doc<"lessons">;
type ChapterDoc = Doc<"chapters">;

export const Route = createFileRoute("/courses/$slug" as any)({
	component: CoursePage,
	loader: async ({ params }) => {
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { course: null, lessons: null, chapters: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const course = await client.query(api.courses.getBySlug, {
				slug: params.slug,
			});

			let lessons = null;
			let chapters = null;
			if (course) {
				lessons = await client.query(api.lessons.listByCourse, {
					courseId: course._id,
					publishedOnly: true,
				});
				chapters = await client.query(api.chapters.listByCourse, {
					courseId: course._id,
					publishedOnly: true,
				});
			}

			return { course, lessons, chapters };
		} catch (error) {
			console.error("Failed to prefetch course:", error);
			return { course: null, lessons: null, chapters: null };
		}
	},
});

function CoursePage() {
	const params = Route.useParams();
	const slug = (params as any).slug as string;
	const { user, isAuthenticated, isLoading: authLoading } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientCourse = useCourseBySlug(slug);
	const course = ((loaderData as any)?.course ?? clientCourse) as
		| EnrichedCourse
		| null
		| undefined;

	const clientLessons = useLessonsByCourse(course?._id, {
		publishedOnly: true,
	});
	const lessons = ((loaderData as any)?.lessons ?? clientLessons) as
		| LessonDoc[]
		| null
		| undefined;

	const clientChapters = useChaptersByCourse(course?._id, {
		publishedOnly: true,
	});
	const chapters = ((loaderData as any)?.chapters ?? clientChapters) as
		| ChapterDoc[]
		| null
		| undefined;

	// Progress tracking
	const progressRecords = useUserCourseProgress(user?.id, course?._id);
	const enrollment = useEnrollment(user?.id, course?._id);

	// Loading state
	if (authLoading || course === undefined) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading course...</p>
					</div>
				</div>
			</div>
		);
	}

	// Not found state
	if (!course) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<FileText className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Course Not Found</h1>
							<p className="mb-6 text-muted-foreground">
								The course you're looking for doesn't exist or has been
								removed.
							</p>
							<Button asChild variant="outline" size="lg">
								<Link to="/courses">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Courses
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Calculate progress
	const totalLessons = lessons?.length || 0;
	const completedLessons =
		progressRecords?.filter((p) => p.isCompleted).length || 0;
	const isEnrolled = enrollment?.status === "active";

	// Prepare meta items for sidebar
	const metaItems: MetaItem[] = [];

	if (course.instructorName) {
		metaItems.push({
			icon: <Users className="h-4 w-4" />,
			label: "Instructor",
			value: course.instructorName,
		});
	}

	if (course.duration) {
		metaItems.push({
			icon: <Clock className="h-4 w-4" />,
			label: "Duration",
			value: `${course.duration} hours`,
		});
	}

	if (totalLessons > 0) {
		metaItems.push({
			icon: <BookOpen className="h-4 w-4" />,
			label: "Lessons",
			value: `${totalLessons} lessons`,
		});
	}

	if (course.publishedAt) {
		metaItems.push({
			icon: <Calendar className="h-4 w-4" />,
			label: "Published",
			value: new Date(course.publishedAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		});
	}

	// Prepare badges
	const badges: Array<{
		label: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}> = [{ label: course.level, variant: "secondary" }];

	if (course.isFeatured) {
		badges.push({ label: "Featured", variant: "secondary" });
	}

	if (course.category) {
		badges.push({ label: course.category, variant: "outline" });
	}

	// Prepare chapters with lessons for curriculum
	const enrichedChapters =
		chapters?.map((chapter) => ({
			...chapter,
			lessons:
				lessons
					?.filter((lesson) => lesson.chapterId === chapter._id)
					.map((lesson) => {
						const progress = progressRecords?.find(
							(p) => p.lessonId === lesson._id,
						);
						return {
							...lesson,
							isCompleted: progress?.isCompleted || false,
							isLocked: !isAuthenticated && course.accessLevel !== "public",
							isFree: lesson.isFree || false,
						};
					})
					.sort((a, b) => a.order - b.order) || [],
		}))
			.sort((a, b) => a.order - b.order) || [];

	// Structured data for SEO
	const courseStructuredData = generateStructuredData({
		type: "Course",
		data: {
			"@type": "Course",
			name: course.title,
			description: course.shortDescription || course.description,
			provider: {
				"@type": "Organization",
				name: "BitBuddies",
				sameAs: "https://bitbuddies.me",
			},
			...(course.instructorName && {
				instructor: {
					"@type": "Person",
					name: course.instructorName,
				},
			}),
		},
	});

	return (
		<>
			<SEO
				title={course.title}
				description={
					course.shortDescription || course.description.substring(0, 160)
				}
				keywords={course.tags.join(", ")}
				canonicalUrl={`/courses/${course.slug}`}
				ogImage={course.coverAsset?.url}
				ogType="article"
			/>
			{courseStructuredData}

			<ContentDetailLayout
				sidebarTitle="Course Info"
				sidebar={
					<>
						<MetaInfoCard title="Course Details" items={metaItems} />

						{isAuthenticated && isEnrolled && totalLessons > 0 && (
							<CourseProgress
								totalLessons={totalLessons}
								completedLessons={completedLessons}
								totalDuration={course.duration ? course.duration * 60 : undefined}
								lastAccessedDate={enrollment?.lastAccessedAt}
								certificateEarned={
									completedLessons === totalLessons && totalLessons > 0
								}
							/>
						)}

						{course.tags && course.tags.length > 0 && (
							<TopicsTags tags={course.tags} title="Topics" variant="card" />
						)}
					</>
				}
			>
				<ContentDetailHeader
					title={course.title}
					description={course.shortDescription}
					badges={badges}
					backLink={{ to: "/courses", label: "Back to Courses" }}
				/>

				<ContentDetailCover
					imageUrl={course.coverAsset?.url}
					alt={course.title}
				/>

				{!isAuthenticated && course.accessLevel !== "public" ? (
					<AuthRequiredCard
						title="Sign In to Access This Course"
						description="Create a free account or sign in to access course content, track your progress, and earn certificates."
						features={[
							"Access to all course lessons and materials",
							"Track your learning progress",
							"Earn certificates upon completion",
							"Join the community and get support",
						]}
					/>
				) : (
					<>
						{/* About Section */}
						<section>
							<SectionHeader eyebrow="Overview" title="About This Course" />
							<div className="prose prose-slate dark:prose-invert max-w-none mt-6">
								<p className="text-lg text-foreground leading-relaxed">
									{course.description}
								</p>
							</div>
						</section>



						{/* Course Curriculum */}
						{enrichedChapters && enrichedChapters.length > 0 && (
							<section>
								<SectionHeader eyebrow="Curriculum" title="Course Content" />
								<div className="mt-6">
									<CourseCurriculum
										chapters={enrichedChapters}
										courseSlug={course.slug}
										showProgress={isAuthenticated && isEnrolled}
										isAuthenticated={isAuthenticated}
									/>
								</div>
							</section>
						)}



						{/* Certificate Info */}
						{isAuthenticated && isEnrolled && (
							<section>
								<div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-8 text-center">
									<div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
										<Award className="h-12 w-12 text-primary" />
									</div>
									<h3 className="text-2xl font-bold mb-2">
										Earn Your Certificate
									</h3>
									<p className="text-muted-foreground mb-6">
										Complete all lessons to earn a certificate of completion for
										this course.
									</p>
									{completedLessons === totalLessons && totalLessons > 0 ? (
										<Button size="lg">Download Certificate</Button>
									) : (
										<p className="text-sm text-muted-foreground">
											Progress: {completedLessons} / {totalLessons} lessons
											completed
										</p>
									)}
								</div>
							</section>
						)}
					</>
				)}
			</ContentDetailLayout>
		</>
	);
}

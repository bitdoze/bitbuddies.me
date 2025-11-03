import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	CheckCircle2,
	Clock,
	FileText,
	GraduationCap,
	ImageIcon,
	Lock,
	Users,
	PlayCircle,
	Award,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SignInButton } from "@clerk/clerk-react";
import { SEO, generateStructuredData } from "../components/common/SEO";
import { LessonVideoPlayer } from "../components/common/VideoPlayer";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useCourseBySlug } from "../hooks/useCourses";
import { useLessonsByCourse } from "../hooks/useLessons";
import { useChaptersByCourse } from "../hooks/useChapters";
import { useUserCourseProgress, useEnrollment } from "../hooks/useProgress";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

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
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
				return { course: null, lessons: null };
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
			return { course: null, lessons: null };
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
	const course = ((loaderData as any)?.course ?? clientCourse) as EnrichedCourse | null | undefined;

	const clientLessons = useLessonsByCourse(course?._id, {
		publishedOnly: true,
	});
	const lessons = ((loaderData as any)?.lessons ?? clientLessons) as LessonDoc[] | null | undefined;

	const clientChapters = useChaptersByCourse(course?._id, {
		publishedOnly: true,
	});
	const chapters = ((loaderData as any)?.chapters ?? clientChapters) as ChapterDoc[] | null | undefined;

	// Progress tracking
	const progressRecords = useUserCourseProgress(user?.id, course?._id);
	const enrollment = useEnrollment(user?.id, course?._id);

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
								The course you're looking for doesn't exist or has been removed.
							</p>
							<Button asChild variant="outline" size="lg">
								<a href="/courses">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Courses
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const requiresAuth = course.accessLevel !== "public";
	const canAccess = !requiresAuth || isAuthenticated;

	if (!canAccess) {
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
				<div className="w-full">
					{/* Hero Section with Cover Image */}
					<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
						<div className="container mx-auto px-4 py-8">
							<Button variant="ghost" asChild className="mb-6">
								<a href="/courses">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Courses
								</a>
							</Button>

							{/* Cover Image */}
							{course.coverAsset?.url ? (
								<div
									className="w-full relative rounded-2xl overflow-hidden shadow-xl mb-8"
									style={{ paddingBottom: "56.25%" }}
								>
									<img
										src={course.coverAsset.url}
										alt={course.title}
										className="absolute inset-0 w-full h-full object-cover"
									/>
								</div>
							) : (
								<div
									className="w-full relative bg-muted rounded-2xl mb-8 shadow-xl"
									style={{ paddingBottom: "56.25%" }}
								>
									<div className="absolute inset-0 flex items-center justify-center">
										<ImageIcon className="h-24 w-24 text-muted-foreground" />
									</div>
								</div>
							)}

							{/* Course Header */}
							<div className="max-w-4xl mx-auto text-center mb-12">
								<div className="flex flex-wrap items-center justify-center gap-2 mb-6">
									<Badge variant="outline" className="text-sm">
										{course.level}
									</Badge>
									{course.accessLevel === "subscription" && (
										<Badge variant="default">Premium Course</Badge>
									)}
								</div>
								<h1 className="text-4xl md:text-5xl font-bold mb-6">
									{course.title}
								</h1>
								{course.shortDescription && (
									<p className="text-xl text-muted-foreground mb-6">
										{course.shortDescription}
									</p>
								)}

								{/* Course Stats */}
								<div className="flex flex-wrap items-center justify-center gap-6 text-sm">
									{course.duration && (
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span>{course.duration} minutes</span>
										</div>
									)}
									{lessons && lessons.length > 0 && (
										<div className="flex items-center gap-2">
											<BookOpen className="h-4 w-4 text-muted-foreground" />
											<span>{lessons.length} lessons</span>
										</div>
									)}
									{course.enrollmentCount > 0 && (
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-muted-foreground" />
											<span>{course.enrollmentCount} students</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</section>

					{/* Sign In CTA */}
					<section className="py-16">
						<div className="container mx-auto px-4">
							<div className="max-w-2xl mx-auto">
								<div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-8 md:p-12 text-center shadow-lg">
									<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
										<Lock className="h-12 w-12 text-primary" />
									</div>
									<h2 className="mb-4 text-2xl md:text-3xl font-bold">
										Sign In to Access This Course
									</h2>
									<p className="mb-8 text-lg text-muted-foreground">
										Create a free account to access all course content and start
										learning today.
									</p>
									<div className="space-y-4 mb-8">
										<div className="flex items-center gap-3 text-left">
											<CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
											<span>
												Access to {lessons?.length || 0} structured video lessons
											</span>
										</div>
										<div className="flex items-center gap-3 text-left">
											<CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
											<span>Track your progress through the course</span>
										</div>
										<div className="flex items-center gap-3 text-left">
											<CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
											<span>Download resources and materials</span>
										</div>
									</div>
									<SignInButton mode="modal">
										<Button size="lg" className="shadow-md">
											Sign In to Continue
										</Button>
									</SignInButton>
								</div>
							</div>
						</div>
					</section>

					{/* Course Preview Info */}
					<section className="py-16 bg-muted/30">
						<div className="container mx-auto px-4">
							<div className="max-w-4xl mx-auto">
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<h2 className="text-2xl font-bold mb-4">About This Course</h2>
									<div
										className="prose prose-slate dark:prose-invert max-w-none"
										dangerouslySetInnerHTML={{ __html: course.description }}
									/>
								</div>
							</div>
						</div>
					</section>
				</div>
			</>
		);
	}

	// User has access - show full course content
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
			{generateStructuredData({
				type: "Course",
				name: course.title,
				description:
					course.shortDescription || course.description.substring(0, 160),
				provider: {
					"@type": "Organization",
					name: "BitBuddies",
					sameAs: typeof window !== "undefined" ? window.location.origin : "",
				},
			})}
			<div className="w-full">
				{/* Hero Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
					<div className="container mx-auto px-4 py-8">
						<Button variant="ghost" asChild className="mb-6">
							<a href="/courses">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Courses
							</a>
						</Button>

						{/* Cover Image */}
						{course.coverAsset?.url ? (
							<div
								className="w-full relative rounded-2xl overflow-hidden shadow-xl mb-8"
								style={{ paddingBottom: "56.25%" }}
							>
								<img
									src={course.coverAsset.url}
									alt={course.title}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							</div>
						) : (
							<div
								className="w-full relative bg-muted rounded-2xl mb-8 shadow-xl"
								style={{ paddingBottom: "56.25%" }}
							>
								<div className="absolute inset-0 flex items-center justify-center">
									<ImageIcon className="h-24 w-24 text-muted-foreground" />
								</div>
							</div>
						)}

						{/* Course Header */}
						<div className="max-w-4xl mx-auto text-center mb-12">
							<div className="flex flex-wrap items-center justify-center gap-2 mb-6">
								<Badge variant="outline" className="text-sm">
									{course.level}
								</Badge>
								{course.accessLevel === "subscription" && (
									<Badge variant="default">Premium Course</Badge>
								)}
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								{course.title}
							</h1>
							{course.shortDescription && (
								<p className="text-xl text-muted-foreground mb-6">
									{course.shortDescription}
								</p>
							)}

							{/* Course Stats */}
							<div className="flex flex-wrap items-center justify-center gap-6 text-sm">
								{course.duration && (
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>{course.duration} minutes</span>
									</div>
								)}
								{lessons && lessons.length > 0 && (
									<div className="flex items-center gap-2">
										<BookOpen className="h-4 w-4 text-muted-foreground" />
										<span>{lessons.length} lessons</span>
									</div>
								)}
								{course.enrollmentCount > 0 && (
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-muted-foreground" />
										<span>{course.enrollmentCount} students</span>
									</div>
								)}
							</div>

							{/* Progress Banner for enrolled users */}
							{enrollment && (
								<div className="mt-8 max-w-2xl mx-auto">
									<div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												{enrollment.progressPercentage === 100 ? (
													<Award className="h-6 w-6 text-primary" />
												) : (
													<PlayCircle className="h-6 w-6 text-primary" />
												)}
												<div className="text-left">
													<h3 className="font-semibold">
														{enrollment.progressPercentage === 100
															? "Course Completed!"
															: "Your Progress"}
													</h3>
													<p className="text-sm text-muted-foreground">
														{enrollment.completedLessons} of {enrollment.totalLessons} lessons
													</p>
												</div>
											</div>
											<span className="text-2xl font-bold text-primary">
												{enrollment.progressPercentage}%
											</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
											<div
												className="h-full bg-primary transition-all duration-300"
												style={{ width: `${enrollment.progressPercentage}%` }}
											/>
										</div>
										<Button asChild size="lg" className="w-full">
											<Link
												to="/courses/$courseSlug/$lessonSlug"
												params={{
													courseSlug: course.slug,
													lessonSlug: lessons?.sort((a, b) => a.order - b.order)[0]?.slug || "",
												}}
											>
												{enrollment.progressPercentage === 0
													? "Start Course"
													: enrollment.progressPercentage === 100
														? "Review Course"
														: "Continue Learning"}
											</Link>
										</Button>
									</div>
								</div>
							)}

							{/* Start Course button for non-enrolled users */}
							{!enrollment && lessons && lessons.length > 0 && (
								<div className="mt-8">
									<Button asChild size="lg">
										<Link
											to="/courses/$courseSlug/$lessonSlug"
											params={{
												courseSlug: course.slug,
												lessonSlug: lessons?.sort((a, b) => a.order - b.order)[0]?.slug || "",
											}}
										>
											<PlayCircle className="mr-2 h-5 w-5" />
											Start Course
										</Link>
									</Button>
								</div>
							)}

							{/* Tags */}
							{course.tags.length > 0 && (
								<div className="flex flex-wrap items-center justify-center gap-2 mt-6">
									{course.tags.map((tag: string) => (
										<span
											key={tag}
											className="text-xs px-3 py-1 bg-muted rounded-full text-muted-foreground font-medium"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Course Description */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-4xl mx-auto">
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="flex items-center gap-3 mb-6">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<GraduationCap className="h-6 w-6" />
									</div>
									<h2 className="text-2xl font-bold">About This Course</h2>
								</div>
								<div
									className="prose prose-slate dark:prose-invert max-w-none"
									dangerouslySetInnerHTML={{ __html: course.description }}
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Course Playlist - Chapters & Lessons */}
				{(chapters && chapters.length > 0) || (lessons && lessons.length > 0) ? (
					<section className="py-16 bg-muted/30">
						<div className="container mx-auto px-4">
							<div className="max-w-4xl mx-auto">
								<div className="mb-8 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<BookOpen className="h-6 w-6" />
										</div>
										<h2 className="text-2xl md:text-3xl font-bold">
											Course Playlist
										</h2>
									</div>

								</div>
								<ChaptersAndLessonsAccordion
									chapters={chapters || []}
									lessons={lessons || []}
									courseSlug={course.slug}
									isAuthenticated={Boolean(isAuthenticated)}
									progressRecords={progressRecords}
								/>
							</div>
						</div>
					</section>
				) : null}
			</div>
		</>
	);
}

function ChaptersAndLessonsAccordion({
	chapters,
	lessons,
	courseSlug,
	isAuthenticated,
	progressRecords,
}: {
	chapters: ChapterDoc[];
	lessons: LessonDoc[];
	courseSlug: string;
	isAuthenticated: boolean;
	progressRecords: Array<{ lessonId: Doc<"lessons">["_id"]; isCompleted: boolean }> | undefined;
}) {
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const [isAllExpanded, setIsAllExpanded] = useState(false);

	// Get all chapter IDs for expand/collapse all
	const allChapterIds = chapters.map((c) => c._id);

	const handleToggleAll = () => {
		if (isAllExpanded) {
			setExpandedItems([]);
			setIsAllExpanded(false);
		} else {
			setExpandedItems(allChapterIds);
			setIsAllExpanded(true);
		}
	};

	// Group lessons by chapter
	const lessonsWithoutChapter = lessons.filter(l => !l.chapterId);
	const lessonsByChapter = lessons.reduce((acc, lesson) => {
		if (lesson.chapterId) {
			if (!acc[lesson.chapterId]) {
				acc[lesson.chapterId] = [];
			}
			acc[lesson.chapterId].push(lesson);
		}
		return acc;
	}, {} as Record<string, LessonDoc[]>);

	// Calculate total lessons per chapter
	const getLessonCount = (chapterId: string) => {
		return lessonsByChapter[chapterId]?.length || 0;
	};

	return (
		<div className="space-y-4">
			{/* Expand/Collapse All Button */}
			{chapters.length > 0 && (
				<div className="flex justify-end mb-4">
					<Button variant="ghost" size="sm" onClick={handleToggleAll}>
						{isAllExpanded ? "Collapse All" : "Expand All"}
					</Button>
				</div>
			)}
			{/* Chapters with lessons */}
			{chapters.map((chapter, chapterIndex) => {
				const chapterLessons = lessonsByChapter[chapter._id] || [];
				const lessonCount = chapterLessons.length;

				return (
					<div key={chapter._id} className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
						{/* Chapter Header */}
						<Accordion
							type="multiple"
							value={expandedItems}
							onValueChange={setExpandedItems}
						>
							<AccordionItem value={chapter._id} className="border-0">
								<AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
									<div className="flex items-center justify-between w-full text-left">
										<h3 className="text-lg font-semibold">
											Chapter {chapterIndex + 1}: {chapter.title}
										</h3>
										<span className="text-sm text-muted-foreground">
											{lessonCount} Lesson{lessonCount !== 1 ? 's' : ''}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-0 py-0">
									{/* Lessons in chapter */}
									<div className="space-y-0 border-t border-border">
										{chapterLessons.sort((a, b) => a.order - b.order).map((lesson, lessonIndex) => (
											<LessonItem
												key={lesson._id}
												lesson={lesson}
												courseSlug={courseSlug}
												lessonNumber={lessonIndex + 1}
												isAuthenticated={isAuthenticated}
												isCompleted={progressRecords?.find((p) => p.lessonId === lesson._id)?.isCompleted ?? false}
											/>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				);
			})}

			{/* Lessons without chapter */}
			{lessonsWithoutChapter.length > 0 && (
				<Accordion
					type="multiple"
					value={expandedItems}
					onValueChange={setExpandedItems}
					className="space-y-4"
				>
					{lessonsWithoutChapter.map((lesson, index) => (
						<AccordionItem
							key={lesson._id}
							value={lesson._id}
							className="rounded-2xl border border-border bg-card shadow-md overflow-hidden"
						>
							<AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
								<LessonHeader
									lesson={lesson}
									courseSlug={courseSlug}
									lessonNumber={index + 1}
									isAuthenticated={isAuthenticated}
									isCompleted={progressRecords?.find((p) => p.lessonId === lesson._id)?.isCompleted ?? false}
								/>
							</AccordionTrigger>
							<AccordionContent className="px-6 py-6 bg-muted/20">
								<LessonContentWrapper lesson={lesson} courseSlug={courseSlug} isAuthenticated={isAuthenticated} />
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</div>
	);
}

function LessonItem({
	lesson,
	courseSlug,
	lessonNumber,
	isAuthenticated,
	isCompleted,
}: {
	lesson: LessonDoc;
	courseSlug: string;
	lessonNumber: number;
	isAuthenticated: boolean;
	isCompleted: boolean;
}) {
	return (
		<Link
			to="/courses/$courseSlug/$lessonSlug"
			params={{ courseSlug, lessonSlug: lesson.slug }}
			className="block px-6 py-4 hover:bg-muted/30 transition-colors border-b border-border last:border-0"
		>
			<LessonHeader
				lesson={lesson}
				courseSlug={courseSlug}
				lessonNumber={lessonNumber}
				isAuthenticated={isAuthenticated}
				isCompleted={isCompleted}
			/>
		</Link>
	);
}

function LessonHeader({
	lesson,
	courseSlug,
	lessonNumber,
	isAuthenticated,
	isCompleted,
}: {
	lesson: LessonDoc;
	courseSlug: string;
	lessonNumber: number;
	isAuthenticated: boolean;
	isCompleted: boolean;
}) {
	const canAccessLesson = Boolean(lesson.isFree) || isAuthenticated;

	return (
		<div className="flex items-center gap-4 w-full text-left">
			<div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
				{isCompleted ? <CheckCircle2 className="h-5 w-5 text-primary" /> : lessonNumber}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h4 className="font-semibold text-base truncate">
						{lesson.title}
					</h4>
					{!canAccessLesson && (
						<Lock className="h-4 w-4 text-muted-foreground shrink-0" />
					)}
					{lesson.isFree && (
						<Badge variant="secondary" className="shrink-0">
							Free
						</Badge>
					)}
				</div>
				{lesson.description && (
					<p className="text-sm text-muted-foreground line-clamp-1">
						{lesson.description}
					</p>
				)}
			</div>
			{lesson.videoDuration && (
				<div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
					<Clock className="h-4 w-4" />
					<span>{formatDuration(lesson.videoDuration)}</span>
				</div>
			)}
		</div>
	);
}

function LessonContentWrapper({
	lesson,
	courseSlug,
	isAuthenticated,
}: {
	lesson: LessonDoc;
	courseSlug: string;
	isAuthenticated: boolean;
}) {
	const canAccessLesson = Boolean(lesson.isFree) || isAuthenticated;

	if (canAccessLesson) {
		return <LessonContent lesson={lesson} />;
	}

	return (
		<div className="text-center py-8">
			<div className="mb-4 inline-flex rounded-full bg-muted p-3">
				<Lock className="h-8 w-8 text-muted-foreground" />
			</div>
			<p className="text-muted-foreground mb-4">
				Sign in to access this lesson
			</p>
			<SignInButton mode="modal">
				<Button size="sm">Sign In</Button>
			</SignInButton>
		</div>
	);
}

function LessonContent({ lesson }: { lesson: LessonDoc }) {
	return (
		<div className="space-y-6">
			{/* Video Player */}
			{(lesson.videoUrl || lesson.videoId) && (
				<div className="rounded-xl overflow-hidden shadow-lg">
					<LessonVideoPlayer lesson={lesson} />
				</div>
			)}

			{/* Lesson Description */}
			{lesson.description && (
				<div>
					<h4 className="font-semibold mb-2">Description</h4>
					<p className="text-muted-foreground">{lesson.description}</p>
				</div>
			)}

			{/* Lesson Content */}
			{lesson.content && (
				<div className="rounded-xl border border-border bg-background p-6">
					<div
						className="prose prose-sm prose-slate dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: lesson.content }}
					/>
				</div>
			)}
		</div>
	);
}

function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

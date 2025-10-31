import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { useMemo, useState } from "react";
import { SEO, generateStructuredData } from "../components/common/SEO";
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
	const { isAuthenticated, isLoading: authLoading } = useAuth();

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
									<Button size="lg" asChild className="shadow-md">
										<a href="/sign-in">Sign In to Continue</a>
									</Button>
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
									<Button variant="ghost" size="sm">
										Expand All
									</Button>
								</div>
								<ChaptersAndLessonsAccordion
									chapters={chapters || []}
									lessons={lessons || []}
									isAuthenticated={Boolean(isAuthenticated)}
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
	isAuthenticated,
}: {
	chapters: ChapterDoc[];
	lessons: LessonDoc[];
	isAuthenticated: boolean;
}) {
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
												lessonNumber={lessonIndex + 1}
												isAuthenticated={isAuthenticated}
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
								<LessonHeader lesson={lesson} lessonNumber={index + 1} isAuthenticated={isAuthenticated} />
							</AccordionTrigger>
							<AccordionContent className="px-6 py-6 bg-muted/20">
								<LessonContentWrapper lesson={lesson} isAuthenticated={isAuthenticated} />
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
	lessonNumber,
	isAuthenticated,
}: {
	lesson: LessonDoc;
	lessonNumber: number;
	isAuthenticated: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Accordion
			type="single"
			collapsible
			value={isOpen ? lesson._id : undefined}
			onValueChange={(value) => setIsOpen(value === lesson._id)}
		>
			<AccordionItem value={lesson._id} className="border-0">
				<AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors border-b border-border last:border-0">
					<LessonHeader lesson={lesson} lessonNumber={lessonNumber} isAuthenticated={isAuthenticated} />
				</AccordionTrigger>
				<AccordionContent className="px-6 py-6 bg-muted/10">
					<LessonContentWrapper lesson={lesson} isAuthenticated={isAuthenticated} />
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function LessonHeader({
	lesson,
	lessonNumber,
	isAuthenticated,
}: {
	lesson: LessonDoc;
	lessonNumber: number;
	isAuthenticated: boolean;
}) {
	const canAccessLesson = Boolean(lesson.isFree) || isAuthenticated;

	return (
		<div className="flex items-center gap-4 w-full text-left">
			<div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
				{lessonNumber}
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
	isAuthenticated,
}: {
	lesson: LessonDoc;
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
			<Button asChild size="sm">
				<a href="/sign-in">Sign In</a>
			</Button>
		</div>
	);
}

function LessonContent({ lesson }: { lesson: LessonDoc }) {
	const embedUrl = useMemo(() => {
		if (!lesson.videoUrl && !lesson.videoId) return null;

		// If videoUrl is already provided, use it
		if (lesson.videoUrl) {
			// Check if it's already an embed URL
			if (lesson.videoUrl.includes("/embed/")) {
				return lesson.videoUrl;
			}
			// Try to extract video ID from various YouTube URL formats
			const videoIdMatch = lesson.videoUrl.match(
				/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
			);
			if (videoIdMatch) {
				return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
			}
			return lesson.videoUrl;
		}

		// Use videoId if provided
		if (lesson.videoId) {
			if (lesson.videoProvider === "bunny") {
				return lesson.videoId; // Bunny stream URLs are used as-is
			}
			// Default to YouTube
			return `https://www.youtube.com/embed/${lesson.videoId}`;
		}

		return null;
	}, [lesson.videoUrl, lesson.videoId, lesson.videoProvider]);

	return (
		<div className="space-y-6">
			{/* Video Player */}
			{embedUrl && (
				<div className="rounded-xl overflow-hidden shadow-lg">
					<div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
						<iframe
							src={embedUrl}
							title={lesson.title}
							className="absolute inset-0 w-full h-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
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

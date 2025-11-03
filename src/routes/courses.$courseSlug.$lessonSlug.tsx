import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Circle,
	Clock,
	Lock,
	PlayCircle,
	FileText,
	ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SignInButton } from "@clerk/clerk-react";
import { SEO } from "../components/common/SEO";
import { LessonVideoPlayer } from "../components/common/VideoPlayer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { useAuth } from "../hooks/useAuth";
import { useCourseBySlug } from "../hooks/useCourses";
import { useLessonsByCourse } from "../hooks/useLessons";
import { useChaptersByCourse } from "../hooks/useChapters";
import {
	useUserCourseProgress,
	useToggleLessonCompletion,
	useLessonCompletion,
} from "../hooks/useProgress";
import type { Doc } from "../../convex/_generated/dataModel";
import { cn } from "../lib/utils";

type EnrichedCourse = Doc<"courses"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

type LessonDoc = Doc<"lessons">;
type ChapterDoc = Doc<"chapters">;

export const Route = createFileRoute("/courses/$courseSlug/$lessonSlug" as any)({
	component: LessonPage,
});

function LessonPage() {
	const params = Route.useParams();
	const courseSlug = (params as any).courseSlug as string;
	const lessonSlug = (params as any).lessonSlug as string;
	const { user, isAuthenticated, isLoading: authLoading } = useAuth();

	// Fetch course data
	const course = useCourseBySlug(courseSlug) as EnrichedCourse | null | undefined;

	// Only fetch lessons/chapters if we have a course ID
	const lessons = useLessonsByCourse(course?._id, { publishedOnly: true }) as LessonDoc[] | null | undefined;
	const chapters = useChaptersByCourse(course?._id, { publishedOnly: true }) as ChapterDoc[] | null | undefined;

	// Get current lesson
	const currentLesson = lessons?.find((l) => l.slug === lessonSlug);

	// Progress tracking - only if authenticated and have course
	const progressRecords = useUserCourseProgress(user?.id, course?._id);
	const toggleCompletion = useToggleLessonCompletion();
	const isCompleted = useLessonCompletion(progressRecords, currentLesson?._id);

	const [isSidebarOpen] = useState(true);

	// Track video watch time for auto-completion (placeholder for future enhancement)
	useEffect(() => {
		// This could be enhanced with actual video player tracking
		// For now, users manually mark lessons complete
	}, []);

	if (authLoading || course === undefined) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground">Loading lesson...</p>
				</div>
			</div>
		);
	}

	if (!course || !currentLesson) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center max-w-md">
					<FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
					<p className="text-muted-foreground mb-6">
						The lesson you're looking for doesn't exist.
					</p>
					<Button asChild variant="outline">
						<Link to="/courses">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Courses
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	// Check if lesson requires authentication (only block if not free)
	if (!isAuthenticated && !currentLesson.isFree) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg">
					<Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
					<p className="text-muted-foreground mb-6">
						Please sign in to access this lesson. Some lessons are available for free preview.
					</p>
					<SignInButton mode="modal">
						<Button>Sign In</Button>
					</SignInButton>
				</div>
			</div>
		);
	}

	const handleToggleCompletion = async () => {
		if (!user?.id || !course?._id || !currentLesson?._id) return;

		try {
			await toggleCompletion({
				clerkId: user.id,
				courseId: course._id,
				lessonId: currentLesson._id,
			});
		} catch (error) {
			console.error("Failed to toggle completion:", error);
		}
	};

	// Organize lessons by chapter
	const lessonsWithoutChapter = lessons?.filter((l) => !l.chapterId) || [];
	const sortedChapters = chapters?.sort((a, b) => a.order - b.order) || [];

	// Calculate progress
	const totalLessons = lessons?.length || 0;
	const completedCount = progressRecords?.filter((p) => p.isCompleted).length || 0;
	const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

	return (
		<>
			<SEO
				title={`${currentLesson.title} - ${course.title}`}
				description={currentLesson.description || course.shortDescription || ""}
				canonicalUrl={`/courses/${course.slug}/${currentLesson.slug}`}
			/>

			<div className="flex h-screen overflow-hidden">
				{/* Sidebar */}
				<aside
					className={cn(
						"w-80 border-r border-border bg-card flex flex-col transition-all duration-300",
						!isSidebarOpen && "-ml-80",
					)}
				>
					<div className="p-4 border-b border-border">
						<Button variant="ghost" size="sm" asChild className="mb-3 w-full justify-start">
							<Link to="/courses/$slug" params={{ slug: course.slug }}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Course
							</Link>
						</Button>
						<h2 className="font-semibold text-sm line-clamp-2 mb-2">{course.title}</h2>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>{completedCount} / {totalLessons} lessons</span>
							<span>•</span>
							<span>{progressPercentage}% complete</span>
						</div>
						<div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					</div>

					<ScrollArea className="flex-1">
						<div className="p-4 space-y-4">
							{/* Chapters with lessons */}
							{sortedChapters.map((chapter, chapterIndex) => {
								const chapterLessons = lessons
									?.filter((l) => l.chapterId === chapter._id)
									.sort((a, b) => a.order - b.order) || [];

								return (
									<div key={chapter._id}>
										<div className="flex items-center gap-2 mb-2">
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
												{chapterIndex + 1}
											</div>
											<h3 className="font-semibold text-sm">{chapter.title}</h3>
										</div>
										<div className="ml-8 space-y-1">
											{chapterLessons.map((lesson) => (
												<LessonNavItem
													key={lesson._id}
													lesson={lesson}
													course={course}
													isActive={lesson._id === currentLesson._id}
													isCompleted={useLessonCompletion(progressRecords, lesson._id)}
													onToggleCompletion={async () => {
														if (user?.id && course?._id) {
															await toggleCompletion({
																clerkId: user.id,
																courseId: course._id,
																lessonId: lesson._id,
															});
														}
													}}
												/>
											))}
										</div>
									</div>
								);
							})}

							{/* Lessons without chapter */}
							{lessonsWithoutChapter.length > 0 && (
								<div>
									<h3 className="font-semibold text-sm mb-2">Other Lessons</h3>
									<div className="space-y-1">
										{lessonsWithoutChapter.map((lesson) => (
											<LessonNavItem
												key={lesson._id}
												lesson={lesson}
												course={course}
												isActive={lesson._id === currentLesson._id}
												isCompleted={useLessonCompletion(progressRecords, lesson._id)}
												onToggleCompletion={async () => {
													if (user?.id && course?._id) {
														await toggleCompletion({
															clerkId: user.id,
															courseId: course._id,
															lessonId: lesson._id,
														});
													}
												}}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					</ScrollArea>
				</aside>

				{/* Main Content */}
				<main className="flex-1 overflow-auto">
					<div className="max-w-5xl mx-auto p-6">
						{/* Lesson Header */}
						<div className="mb-6">
							<div className="flex items-start justify-between gap-4 mb-4">
								<div className="flex-1">
									<h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
									{currentLesson.description && (
										<p className="text-muted-foreground">{currentLesson.description}</p>
									)}
								</div>
								{isAuthenticated && (
									<Button
										variant={isCompleted ? "default" : "outline"}
										size="sm"
										onClick={handleToggleCompletion}
										className="shrink-0"
									>
										{isCompleted ? (
											<>
												<CheckCircle2 className="mr-2 h-4 w-4" />
												Completed
											</>
										) : (
											<>
												<Circle className="mr-2 h-4 w-4" />
												Mark Complete
											</>
										)}
									</Button>
								)}
							</div>

							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								{currentLesson.videoDuration && (
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>{formatDuration(currentLesson.videoDuration)}</span>
									</div>
								)}
								{currentLesson.isFree && (
									<Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
										Free Preview
									</Badge>
								)}
								{!isAuthenticated && currentLesson.isFree && (
									<Badge variant="outline">
										Sign in to track progress
									</Badge>
								)}
							</div>
						</div>

						{/* Video Player */}
						{(currentLesson.videoUrl || currentLesson.videoId) && (
							<div className="mb-8">
								<LessonVideoPlayer lesson={currentLesson} />
							</div>
						)}

						{/* Lesson Content */}
						{currentLesson.content && (
							<div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
								<div
									className="prose prose-slate dark:prose-invert max-w-none"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted admin source
									dangerouslySetInnerHTML={{ __html: currentLesson.content }}
								/>
							</div>
						)}

						{/* Lesson Navigation */}
						<div className="mt-8 flex items-center justify-between gap-4">
							{getPreviousLesson(lessons, currentLesson) ? (
								<Button variant="outline" asChild>
									<Link
										to="/courses/$courseSlug/$lessonSlug"
										params={{
											courseSlug: course.slug,
											lessonSlug: getPreviousLesson(lessons, currentLesson)?.slug || "",
										}}
									>
										<ArrowLeft className="mr-2 h-4 w-4" />
										Previous Lesson
									</Link>
								</Button>
							) : (
								<div />
							)}

							{getNextLesson(lessons, currentLesson) ? (
								<Button asChild>
									<Link
										to="/courses/$courseSlug/$lessonSlug"
										params={{
											courseSlug: course.slug,
											lessonSlug: getNextLesson(lessons, currentLesson)?.slug || "",
										}}
									>
										Next Lesson
										<ChevronRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							) : (
								<Button variant="outline" asChild>
									<Link to="/courses/$slug" params={{ slug: course.slug }}>
										Back to Course
										<ChevronRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							)}
						</div>
					</div>
				</main>
			</div>
		</>
	);
}

// Lesson navigation item component
function LessonNavItem({
	lesson,
	course,
	isActive,
	isCompleted,
	onToggleCompletion,
}: {
	lesson: LessonDoc;
	course: EnrichedCourse;
	isActive: boolean;
	isCompleted: boolean;
	onToggleCompletion: () => void;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group",
				isActive && "bg-primary/10 hover:bg-primary/15",
			)}
		>
			<Checkbox
				checked={isCompleted}
				onCheckedChange={onToggleCompletion}
				className="shrink-0"
				onClick={(e) => e.stopPropagation()}
			/>
			<Link
				to="/courses/$courseSlug/$lessonSlug"
				params={{ courseSlug: course.slug, lessonSlug: lesson.slug }}
				className="flex-1 flex items-center gap-2 min-w-0"
			>
				<PlayCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				<span
					className={cn(
						"text-sm truncate",
						isActive && "font-semibold text-primary",
						isCompleted && !isActive && "text-muted-foreground line-through",
					)}
				>
					{lesson.title}
				</span>
			</Link>
			{lesson.videoDuration && (
				<span className="text-xs text-muted-foreground shrink-0">
					{formatDuration(lesson.videoDuration)}
				</span>
			)}
		</div>
	);
}

// Helper functions
function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getPreviousLesson(
	lessons: LessonDoc[] | null | undefined,
	currentLesson: LessonDoc,
): LessonDoc | null {
	if (!lessons) return null;
	const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
	const currentIndex = sortedLessons.findIndex((l) => l._id === currentLesson._id);
	return currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
}

function getNextLesson(
	lessons: LessonDoc[] | null | undefined,
	currentLesson: LessonDoc,
): LessonDoc | null {
	if (!lessons) return null;
	const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
	const currentIndex = sortedLessons.findIndex((l) => l._id === currentLesson._id);
	return currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
}

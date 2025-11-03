import type React from "react";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lesson {
	_id: string;
	title: string;
	slug: string;
	duration?: number;
	order: number;
	isCompleted?: boolean;
	isLocked?: boolean;
	isFree?: boolean;
}

interface Chapter {
	_id: string;
	title: string;
	description?: string;
	order: number;
	lessons: Lesson[];
}

interface CourseCurriculumProps {
	chapters: Chapter[];
	courseSlug: string;
	currentLessonId?: string;
	showProgress?: boolean;
	isAuthenticated?: boolean;
	className?: string;
}

/**
 * CourseCurriculum - Lesson list/accordion for course navigation
 *
 * Features:
 * - Accordion view grouped by chapters
 * - Lesson completion status
 * - Locked/unlocked indicators
 * - Free lesson badges
 * - Current lesson highlight
 * - Duration display
 * - Progress tracking
 *
 * Usage:
 * <CourseCurriculum
 *   chapters={chapters}
 *   courseSlug={course.slug}
 *   currentLessonId={currentLesson?._id}
 *   showProgress={true}
 *   isAuthenticated={isAuthenticated}
 * />
 */
export function CourseCurriculum({
	chapters,
	courseSlug,
	currentLessonId,
	showProgress = true,
	isAuthenticated = false,
	className,
}: CourseCurriculumProps) {
	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	const getChapterStats = (chapter: Chapter) => {
		const totalLessons = chapter.lessons.length;
		const completedLessons = chapter.lessons.filter(
			(l) => l.isCompleted,
		).length;
		const totalDuration = chapter.lessons.reduce(
			(acc, lesson) => acc + (lesson.duration || 0),
			0,
		);

		return {
			totalLessons,
			completedLessons,
			totalDuration,
			isCompleted: completedLessons === totalLessons && totalLessons > 0,
		};
	};

	// Default to first chapter open if no current lesson
	const defaultValue = chapters.length > 0 ? `chapter-${chapters[0]._id}` : "";

	return (
		<div className={className}>
			<Accordion
				type="single"
				collapsible
				defaultValue={defaultValue}
				className="space-y-4"
			>
				{chapters.map((chapter) => {
					const stats = getChapterStats(chapter);
					const hasCurrentLesson = chapter.lessons.some(
						(l) => l._id === currentLessonId,
					);

					return (
						<AccordionItem
							key={chapter._id}
							value={`chapter-${chapter._id}`}
							className={cn(
								"rounded-2xl border border-border bg-card shadow-sm",
								hasCurrentLesson && "border-primary/50",
							)}
						>
							<AccordionTrigger className="px-6 py-4 hover:no-underline group">
								<div className="flex-1 text-left">
									<div className="flex items-center justify-between gap-4 mb-1">
										<h3 className="font-semibold text-base group-hover:text-primary transition-colors">
											{chapter.title}
										</h3>
										<div className="flex items-center gap-2 shrink-0">
											{showProgress && stats.isCompleted && (
												<Badge
													variant="default"
													className="bg-green-500 hover:bg-green-600"
												>
													<CheckCircle2 className="h-3 w-3 mr-1" />
													Complete
												</Badge>
											)}
											<span className="text-xs text-muted-foreground">
												{stats.totalLessons}{" "}
												{stats.totalLessons === 1 ? "lesson" : "lessons"}
											</span>
											{stats.totalDuration > 0 && (
												<>
													<span className="text-xs text-muted-foreground">•</span>
													<span className="text-xs text-muted-foreground">
														{formatDuration(stats.totalDuration)}
													</span>
												</>
											)}
										</div>
									</div>
									{chapter.description && (
										<p className="text-sm text-muted-foreground">
											{chapter.description}
										</p>
									)}
									{showProgress && stats.totalLessons > 0 && (
										<div className="mt-3">
											<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
												<div
													className={cn(
														"h-full transition-all duration-300",
														stats.isCompleted
															? "bg-green-500"
															: "bg-primary",
													)}
													style={{
														width: `${(stats.completedLessons / stats.totalLessons) * 100}%`,
													}}
												/>
											</div>
										</div>
									)}
								</div>
							</AccordionTrigger>

							<AccordionContent className="px-6 pb-4">
								<div className="space-y-1">
									{chapter.lessons
										.sort((a, b) => a.order - b.order)
										.map((lesson, index) => {
											const isCurrentLesson = lesson._id === currentLessonId;
											const isLocked =
												lesson.isLocked && !isAuthenticated && !lesson.isFree;
											const canAccess = !isLocked || lesson.isFree;

											return (
												<div
													key={lesson._id}
													className={cn(
														"group rounded-lg transition-all",
														isCurrentLesson && "bg-primary/5",
													)}
												>
													{canAccess ? (
														<Link
															to="/courses/$courseSlug/$lessonSlug"
															params={{
																courseSlug,
																lessonSlug: lesson.slug,
															}}
															className={cn(
																"flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
																isCurrentLesson && "bg-primary/10 hover:bg-primary/15",
															)}
														>
															{/* Status Icon */}
															<div className="shrink-0">
																{lesson.isCompleted ? (
																	<CheckCircle2 className="h-5 w-5 text-green-500" />
																) : (
																	<Circle className="h-5 w-5 text-muted-foreground" />
																)}
															</div>

															{/* Lesson Number & Title */}
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2">
																	<span className="text-xs font-medium text-muted-foreground">
																		{index + 1}.
																	</span>
																	<span
																		className={cn(
																			"text-sm font-medium truncate",
																			isCurrentLesson && "text-primary",
																		)}
																	>
																		{lesson.title}
																	</span>
																</div>
															</div>

															{/* Badges & Duration */}
															<div className="flex items-center gap-2 shrink-0">
																{lesson.isFree && (
																	<Badge variant="outline" className="text-xs">
																		Free
																	</Badge>
																)}
																{lesson.duration && (
																	<span className="text-xs text-muted-foreground">
																		{formatDuration(lesson.duration)}
																	</span>
																)}
																<PlayCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
															</div>
														</Link>
													) : (
														<div
															className={cn(
																"flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed",
															)}
														>
															{/* Locked Icon */}
															<div className="shrink-0">
																<Lock className="h-5 w-5 text-muted-foreground" />
															</div>

															{/* Lesson Number & Title */}
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2">
																	<span className="text-xs font-medium text-muted-foreground">
																		{index + 1}.
																	</span>
																	<span className="text-sm font-medium text-muted-foreground truncate">
																		{lesson.title}
																	</span>
																</div>
															</div>

															{/* Duration */}
															{lesson.duration && (
																<span className="text-xs text-muted-foreground shrink-0">
																	{formatDuration(lesson.duration)}
																</span>
															)}
														</div>
													)}
												</div>
											);
										})}
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>

			{/* Empty State */}
			{chapters.length === 0 && (
				<div className="text-center py-12 px-4 rounded-2xl border border-border bg-card">
					<PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<p className="text-sm text-muted-foreground">
						No lessons available yet
					</p>
				</div>
			)}
		</div>
	);
}

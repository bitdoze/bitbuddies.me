import type React from "react";
import { Award, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseProgressProps {
	totalLessons: number;
	completedLessons: number;
	totalDuration?: number;
	timeSpent?: number;
	lastAccessedDate?: number;
	certificateEarned?: boolean;
	className?: string;
}

/**
 * CourseProgress - Progress tracking widget for courses
 *
 * Features:
 * - Visual progress bar
 * - Completion percentage
 * - Lesson completion count
 * - Time tracking (optional)
 * - Certificate status
 * - Last accessed date
 *
 * Usage:
 * <CourseProgress
 *   totalLessons={24}
 *   completedLessons={12}
 *   totalDuration={360}
 *   timeSpent={180}
 *   certificateEarned={false}
 * />
 */
export function CourseProgress({
	totalLessons,
	completedLessons,
	totalDuration,
	timeSpent,
	lastAccessedDate,
	certificateEarned = false,
	className,
}: CourseProgressProps) {
	const progressPercentage = totalLessons
		? Math.round((completedLessons / totalLessons) * 100)
		: 0;

	const isCompleted = progressPercentage === 100;

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card className={cn("border-2", isCompleted && "border-green-500/50", className)}>
			<CardHeader>
				<CardTitle className="text-lg flex items-center justify-between">
					<span className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Your Progress
					</span>
					{isCompleted && (
						<Badge variant="default" className="bg-green-500 hover:bg-green-600">
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Complete
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Progress Percentage */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-2xl font-bold text-primary">
							{progressPercentage}%
						</span>
						<span className="text-sm text-muted-foreground">
							{completedLessons} / {totalLessons} lessons
						</span>
					</div>

					{/* Progress Bar */}
					<div className="w-full h-3 bg-muted rounded-full overflow-hidden">
						<div
							className={cn(
								"h-full transition-all duration-500",
								isCompleted
									? "bg-green-500"
									: "bg-gradient-to-r from-primary to-primary/70",
							)}
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3 pt-2">
					{/* Total Duration */}
					{totalDuration && (
						<div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
							<Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
							<div className="flex-1 min-w-0">
								<dt className="text-xs text-muted-foreground mb-0.5">
									Total Time
								</dt>
								<dd className="text-sm font-semibold">
									{formatDuration(totalDuration)}
								</dd>
							</div>
						</div>
					)}

					{/* Time Spent */}
					{timeSpent !== undefined && (
						<div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
							<Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
							<div className="flex-1 min-w-0">
								<dt className="text-xs text-muted-foreground mb-0.5">
									Time Spent
								</dt>
								<dd className="text-sm font-semibold">
									{formatDuration(timeSpent)}
								</dd>
							</div>
						</div>
					)}
				</div>

				{/* Certificate Status */}
				{isCompleted && (
					<div className="pt-4 border-t border-border">
						{certificateEarned ? (
							<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
								<p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
									<Award className="h-4 w-4" />
									Certificate Earned
								</p>
							</div>
						) : (
							<div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
								<p className="text-sm font-medium text-primary flex items-center gap-2">
									<Award className="h-4 w-4" />
									Certificate Available
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Complete all lessons to earn your certificate
								</p>
							</div>
						)}
					</div>
				)}

				{/* Last Accessed */}
				{lastAccessedDate && (
					<div className="pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground">
							Last accessed: {formatDate(lastAccessedDate)}
						</p>
					</div>
				)}

				{/* Motivational Message */}
				{!isCompleted && progressPercentage > 0 && (
					<div className="pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground">
							{progressPercentage >= 75
								? "You're almost there! Keep going! 🚀"
								: progressPercentage >= 50
									? "Great progress! You're halfway through! 💪"
									: "Keep learning! Every lesson counts! 📚"}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

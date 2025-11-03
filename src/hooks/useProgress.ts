import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Get user's progress for all lessons in a course
 */
export function useUserCourseProgress(
	clerkId: string | null | undefined,
	courseId: Id<"courses"> | undefined,
) {
	return useQuery(
		api.progress.getUserCourseProgress,
		clerkId && courseId ? { clerkId, courseId } : "skip",
	);
}

/**
 * Get user's enrollment status for a course
 */
export function useEnrollment(
	clerkId: string | null | undefined,
	courseId: Id<"courses"> | undefined,
) {
	return useQuery(
		api.progress.getEnrollment,
		clerkId && courseId ? { clerkId, courseId } : "skip",
	);
}

/**
 * Toggle lesson completion status
 */
export function useToggleLessonCompletion() {
	return useMutation(api.progress.toggleLessonCompletion);
}

/**
 * Update lesson watch progress (for video tracking)
 */
export function useUpdateLessonProgress() {
	return useMutation(api.progress.updateLessonProgress);
}

/**
 * Helper hook to check if a specific lesson is completed
 */
export function useLessonCompletion(
	progressRecords:
		| Array<{ lessonId: Id<"lessons">; isCompleted: boolean }>
		| undefined,
	lessonId: Id<"lessons"> | undefined,
) {
	if (!progressRecords || !lessonId) {
		return false;
	}

	const progress = progressRecords.find((p) => p.lessonId === lessonId);
	return progress?.isCompleted ?? false;
}

/**
 * Helper to calculate course progress percentage
 */
export function calculateProgress(
	progressRecords: Array<{ isCompleted: boolean }> | undefined,
	totalLessons: number,
): number {
	if (!progressRecords || totalLessons === 0) {
		return 0;
	}

	const completedCount = progressRecords.filter((p) => p.isCompleted).length;
	return Math.round((completedCount / totalLessons) * 100);
}

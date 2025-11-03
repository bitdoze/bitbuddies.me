import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Get user's progress for a specific course
 */
export const getCourseProgress = query({
	args: {
		userId: v.id("users"),
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
			.first();

		if (!user) {
			return null;
		}

		// Get enrollment
		const enrollment = await ctx.db
			.query("enrollments")
			.withIndex("by_user_and_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.first();

		if (!enrollment) {
			return null;
		}

		// Get all progress records for this enrollment
		const progressRecords = await ctx.db
			.query("progress")
			.withIndex("by_enrollment_id", (q) => q.eq("enrollmentId", enrollment._id))
			.collect();

		return {
			enrollment,
			progressRecords,
		};
	},
});

/**
 * Get user's progress for a specific lesson
 */
export const getLessonProgress = query({
	args: {
		userId: v.id("users"),
		lessonId: v.id("lessons"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
			.first();

		if (!user) {
			return null;
		}

		const progress = await ctx.db
			.query("progress")
			.withIndex("by_user_and_lesson", (q) =>
				q.eq("userId", user._id).eq("lessonId", args.lessonId),
			)
			.first();

		return progress;
	},
});

/**
 * Get all progress records for a user in a course (by clerkId)
 */
export const getUserCourseProgress = query({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			return [];
		}

		// Get enrollment
		const enrollment = await ctx.db
			.query("enrollments")
			.withIndex("by_user_and_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.first();

		if (!enrollment) {
			return [];
		}

		// Get all progress records
		const progressRecords = await ctx.db
			.query("progress")
			.withIndex("by_enrollment_id", (q) => q.eq("enrollmentId", enrollment._id))
			.collect();

		return progressRecords;
	},
});

/**
 * Mark a lesson as complete (or toggle completion)
 */
export const toggleLessonCompletion = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
		lessonId: v.id("lessons"),
	},
	handler: async (ctx, args) => {
		// Get user from clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		// Get or create enrollment
		let enrollment = await ctx.db
			.query("enrollments")
			.withIndex("by_user_and_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.first();

		if (!enrollment) {
			// Create enrollment
			const course = await ctx.db.get(args.courseId);
			if (!course) {
				throw new Error("Course not found");
			}

			// Count total lessons in course
			const allLessons = await ctx.db
				.query("lessons")
				.withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
				.filter((q) => q.and(q.eq(q.field("isDeleted"), false), q.eq(q.field("isPublished"), true)))
				.collect();

			const enrollmentId = await ctx.db.insert("enrollments", {
				userId: user._id,
				contentType: "course",
				courseId: args.courseId,
				status: "active",
				progressPercentage: 0,
				completedLessons: 0,
				totalLessons: allLessons.length,
				enrolledAt: Date.now(),
				lastAccessedAt: Date.now(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			enrollment = (await ctx.db.get(enrollmentId))!;
		}

		// Get or create progress record
		let progress = await ctx.db
			.query("progress")
			.withIndex("by_user_and_lesson", (q) =>
				q.eq("userId", user._id).eq("lessonId", args.lessonId),
			)
			.first();

		const now = Date.now();

		if (!progress) {
			// Create new progress record as completed
			await ctx.db.insert("progress", {
				enrollmentId: enrollment._id,
				userId: user._id,
				lessonId: args.lessonId,
				isCompleted: true,
				completionPercentage: 100,
				watchedDuration: 0,
				startedAt: now,
				completedAt: now,
				lastWatchedAt: now,
				createdAt: now,
				updatedAt: now,
			});
		} else {
			// Toggle completion status
			await ctx.db.patch(progress._id, {
				isCompleted: !progress.isCompleted,
				completionPercentage: !progress.isCompleted ? 100 : progress.completionPercentage,
				completedAt: !progress.isCompleted ? now : undefined,
				lastWatchedAt: now,
				updatedAt: now,
			});
		}

		// Update enrollment stats
		const allProgress = await ctx.db
			.query("progress")
			.withIndex("by_enrollment_id", (q) => q.eq("enrollmentId", enrollment._id))
			.collect();

		const completedCount = allProgress.filter((p) => p.isCompleted).length;
		const progressPercentage =
			enrollment.totalLessons > 0
				? Math.round((completedCount / enrollment.totalLessons) * 100)
				: 0;

		await ctx.db.patch(enrollment._id, {
			completedLessons: completedCount,
			progressPercentage,
			status: progressPercentage === 100 ? "completed" : "active",
			completedAt: progressPercentage === 100 ? now : undefined,
			lastAccessedAt: now,
			updatedAt: now,
		});

		return {
			success: true,
			completedCount,
			totalLessons: enrollment.totalLessons,
			progressPercentage,
		};
	},
});

/**
 * Update lesson watch progress (for video tracking)
 */
export const updateLessonProgress = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
		lessonId: v.id("lessons"),
		watchedDuration: v.number(),
		completionPercentage: v.number(),
	},
	handler: async (ctx, args) => {
		// Get user from clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		// Get or create enrollment
		let enrollment = await ctx.db
			.query("enrollments")
			.withIndex("by_user_and_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.first();

		if (!enrollment) {
			// Create enrollment
			const course = await ctx.db.get(args.courseId);
			if (!course) {
				throw new Error("Course not found");
			}

			// Count total lessons in course
			const allLessons = await ctx.db
				.query("lessons")
				.withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
				.filter((q) => q.and(q.eq(q.field("isDeleted"), false), q.eq(q.field("isPublished"), true)))
				.collect();

			const enrollmentId = await ctx.db.insert("enrollments", {
				userId: user._id,
				contentType: "course",
				courseId: args.courseId,
				status: "active",
				progressPercentage: 0,
				completedLessons: 0,
				totalLessons: allLessons.length,
				enrolledAt: Date.now(),
				lastAccessedAt: Date.now(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			enrollment = (await ctx.db.get(enrollmentId))!;
		}

		// Get or create progress record
		let progress = await ctx.db
			.query("progress")
			.withIndex("by_user_and_lesson", (q) =>
				q.eq("userId", user._id).eq("lessonId", args.lessonId),
			)
			.first();

		const now = Date.now();
		const isCompleted = args.completionPercentage >= 90; // Auto-complete at 90%

		if (!progress) {
			// Create new progress record
			await ctx.db.insert("progress", {
				enrollmentId: enrollment._id,
				userId: user._id,
				lessonId: args.lessonId,
				isCompleted,
				completionPercentage: args.completionPercentage,
				watchedDuration: args.watchedDuration,
				startedAt: now,
				completedAt: isCompleted ? now : undefined,
				lastWatchedAt: now,
				createdAt: now,
				updatedAt: now,
			});
		} else {
			// Update progress
			await ctx.db.patch(progress._id, {
				isCompleted: isCompleted || progress.isCompleted,
				completionPercentage: Math.max(args.completionPercentage, progress.completionPercentage),
				watchedDuration: Math.max(args.watchedDuration, progress.watchedDuration || 0),
				completedAt: isCompleted && !progress.completedAt ? now : progress.completedAt,
				lastWatchedAt: now,
				updatedAt: now,
			});
		}

		// Update enrollment last accessed
		await ctx.db.patch(enrollment._id, {
			lastAccessedAt: now,
			updatedAt: now,
		});

		return { success: true };
	},
});

/**
 * Get enrollment status for a user in a course
 */
export const getEnrollment = query({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			return null;
		}

		const enrollment = await ctx.db
			.query("enrollments")
			.withIndex("by_user_and_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.first();

		return enrollment;
	},
});

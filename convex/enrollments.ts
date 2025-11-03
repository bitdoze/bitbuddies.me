import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireAdmin } from "./utils"

const contentTypeEnum = v.union(
	v.literal("course"),
	v.literal("workshop"),
)

const statusEnum = v.union(
	v.literal("active"),
	v.literal("completed"),
	v.literal("dropped"),
)

const resolveContent = (args: {
	contentType: "course" | "workshop"
	courseId?: string
	workshopId?: string
}) => {
	const hasCourse = !!args.courseId
	const hasWorkshop = !!args.workshopId

	if (args.contentType === "course" && !hasCourse) {
		throw new Error("courseId is required when contentType is course")
	}

	if (args.contentType === "workshop" && !hasWorkshop) {
		throw new Error("workshopId is required when contentType is workshop")
	}

	if (hasCourse && hasWorkshop) {
		throw new Error("Provide only one of courseId or workshopId")
	}
}

export const create = mutation({
	args: {
		clerkId: v.string(),
		contentType: contentTypeEnum,
		courseId: v.optional(v.id("courses")),
		workshopId: v.optional(v.id("workshops")),
		status: v.optional(statusEnum),
	},
	handler: async (ctx, args) => {
		// Get user from clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		if (!user) {
			throw new Error("User not found")
		}

		resolveContent(args)

		const now = Date.now()
		const status = args.status ?? "active"
		let courseId: typeof args.courseId | undefined
		let workshopId: typeof args.workshopId | undefined
		let totalLessons = 0

		if (args.contentType === "course" && args.courseId) {
			const course = await ctx.db.get(args.courseId)
			if (!course || course.isDeleted) {
				throw new Error("Course not found or deleted")
			}

			courseId = args.courseId

			totalLessons = await ctx.db
				.query("lessons")
				.withIndex("by_course_id", (index) =>
					index.eq("courseId", args.courseId!),
				)
				.filter((filter) =>
					filter.eq(filter.field("isDeleted"), false),
				)
				.collect()
				.then((lessons) => lessons.length)

			await ctx.db.patch(args.courseId, {
				enrollmentCount: course.enrollmentCount + 1,
				updatedAt: now,
			})
		}

		if (args.contentType === "workshop" && args.workshopId) {
			const workshop = await ctx.db.get(args.workshopId)
			if (!workshop || workshop.isDeleted) {
				throw new Error("Workshop not found or deleted")
			}

			workshopId = args.workshopId

			await ctx.db.patch(args.workshopId, {
				enrollmentCount: workshop.enrollmentCount + 1,
				updatedAt: now,
			})
		}

		return ctx.db.insert("enrollments", {
			userId: user._id,
			contentType: args.contentType,
			courseId,
			workshopId,
			status,
			progressPercentage: 0,
			completedLessons: 0,
			totalLessons,
			enrolledAt: now,
			completedAt: undefined,
			lastAccessedAt: now,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const updateProgress = mutation({
	args: {
		clerkId: v.string(),
		enrollmentId: v.id("enrollments"),
		completedLessons: v.number(),
		progressPercentage: v.number(),
		lastAccessedAt: v.optional(v.number()),
		markCompleted: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		// Get user from clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		if (!user) {
			throw new Error("User not found")
		}

		const enrollment = await ctx.db.get(args.enrollmentId)
		if (!enrollment) {
			throw new Error("Enrollment not found")
		}

		// Verify ownership
		if (enrollment.userId !== user._id) {
			throw new Error("You can only update your own enrollments")
		}

		if (args.completedLessons < 0) {
			throw new Error("completedLessons cannot be negative")
		}

		if (args.completedLessons > enrollment.totalLessons) {
			throw new Error("completedLessons cannot exceed totalLessons")
		}

		if (args.progressPercentage < 0 || args.progressPercentage > 100) {
			throw new Error("progressPercentage must be between 0 and 100")
		}

		const now = Date.now()
		const finished =
			args.markCompleted ||
			(enrollment.contentType === "workshop" &&
				args.progressPercentage === 100) ||
			(enrollment.contentType === "course" &&
				enrollment.totalLessons > 0 &&
				args.completedLessons === enrollment.totalLessons)

		let completedAt = enrollment.completedAt
		let status = enrollment.status

		if (finished) {
			status = "completed"
			completedAt = completedAt ?? now
		}

		await ctx.db.patch(args.enrollmentId, {
			completedLessons: args.completedLessons,
			progressPercentage: args.progressPercentage,
			lastAccessedAt: args.lastAccessedAt ?? now,
			status,
			completedAt,
			updatedAt: now,
		})

		if (finished && enrollment.contentType === "course" && enrollment.courseId) {
			const course = await ctx.db.get(enrollment.courseId)
			if (course) {
				await ctx.db.patch(enrollment.courseId, {
					completionCount: course.completionCount + 1,
					updatedAt: now,
				})
			}
		}
	},
})

export const setStatus = mutation({
	args: {
		clerkId: v.string(),
		enrollmentId: v.id("enrollments"),
		status: statusEnum,
	},
	handler: async (ctx, args) => {
		// Get user from clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		if (!user) {
			throw new Error("User not found")
		}

		const enrollment = await ctx.db.get(args.enrollmentId)
		if (!enrollment) {
			throw new Error("Enrollment not found")
		}

		// Verify ownership
		if (enrollment.userId !== user._id) {
			throw new Error("You can only update your own enrollments")
		}

		const now = Date.now()
		let completedAt = enrollment.completedAt

		if (args.status === "completed" && !completedAt) {
			completedAt = now
		}

		if (args.status !== "completed") {
			completedAt = undefined
		}

		await ctx.db.patch(args.enrollmentId, {
			status: args.status,
			completedAt,
			updatedAt: now,
		})
	},
})

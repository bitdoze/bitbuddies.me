import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { ensureUniqueSlug } from "./utils"

/**
 * Helper to verify admin role
 */
async function requireAdmin(ctx: any, clerkId: string) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
		.first()

	if (!user) {
		throw new Error("User not found")
	}

	if (user.role !== "admin") {
		throw new Error("Admin access required")
	}

	return user
}

const lessonFields = {
	courseId: v.id("courses"),
	chapterId: v.optional(v.id("chapters")),
	title: v.string(),
	slug: v.string(),
	description: v.optional(v.string()),
	content: v.optional(v.string()),
	videoProvider: v.optional(
		v.union(v.literal("youtube"), v.literal("bunny")),
	),
	videoId: v.optional(v.string()),
	videoUrl: v.optional(v.string()),
	videoDuration: v.optional(v.number()),
	order: v.number(),
	isPublished: v.optional(v.boolean()),
	isFree: v.optional(v.boolean()),
}

export const listByCourse = query({
	args: {
		courseId: v.id("courses"),
		publishedOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const publishedOnly = args.publishedOnly ?? true

		let query = ctx.db
			.query("lessons")
			.withIndex("by_course_and_order", (q) =>
				q.eq("courseId", args.courseId),
			)
			.filter((q) => q.eq(q.field("isDeleted"), false))

		const lessons = await query.collect()

		const filtered = lessons.filter(
			(l) => !publishedOnly || l.isPublished,
		)

		// Sort by order
		return filtered.sort((a, b) => a.order - b.order)
	},
})

export const getBySlug = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx, args) => {
		const lesson = await ctx.db
			.query("lessons")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.filter((q) => q.eq(q.field("isDeleted"), false))
			.first()

		return lesson ?? null
	},
})

export const getById = query({
	args: {
		lessonId: v.id("lessons"),
	},
	handler: async (ctx, args) => {
		const lesson = await ctx.db.get(args.lessonId)

		if (!lesson || lesson.isDeleted) {
			return null
		}

		return lesson
	},
})

export const create = mutation({
	args: {
		...lessonFields,
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		// Verify course exists
		const course = await ctx.db.get(args.courseId)
		if (!course || course.isDeleted) {
			throw new Error("Course not found")
		}

		await ensureUniqueSlug(ctx, "lessons", args.slug)

		const now = Date.now()
		const isPublished = args.isPublished ?? false
		const isFree = args.isFree ?? false

		return ctx.db.insert("lessons", {
			courseId: args.courseId,
			chapterId: args.chapterId,
			title: args.title,
			slug: args.slug,
			description: args.description,
			content: args.content,
			videoProvider: args.videoProvider,
			videoId: args.videoId,
			videoUrl: args.videoUrl,
			videoDuration: args.videoDuration,
			order: args.order,
			isPublished,
			isFree,
			isDeleted: false,
			deletedAt: undefined,
			publishedAt: isPublished ? now : undefined,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		lessonId: v.id("lessons"),
		patch: v.object({
			chapterId: v.optional(v.id("chapters")),
			title: v.optional(v.string()),
			slug: v.optional(v.string()),
			description: v.optional(v.string()),
			content: v.optional(v.string()),
			videoProvider: v.optional(
				v.union(v.literal("youtube"), v.literal("bunny")),
			),
			videoId: v.optional(v.string()),
			videoUrl: v.optional(v.string()),
			videoDuration: v.optional(v.number()),
			order: v.optional(v.number()),
			isPublished: v.optional(v.boolean()),
			isFree: v.optional(v.boolean()),
		}),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const lesson = await ctx.db.get(args.lessonId)
		if (!lesson) {
			throw new Error("Lesson not found")
		}

		if (args.patch.slug) {
			await ensureUniqueSlug(ctx, "lessons", args.patch.slug, args.lessonId)
		}

		const now = Date.now()
		const next: Partial<typeof lesson> = { updatedAt: now }

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			if (value !== undefined) {
				;(next as Record<string, unknown>)[key as string] = value
			}
		}

		// Set publishedAt if being published for the first time
		if (
			typeof args.patch.isPublished === "boolean" &&
			args.patch.isPublished &&
			!lesson.publishedAt
		) {
			next.publishedAt = now
		}

		return ctx.db.patch(args.lessonId, next)
	},
})

export const softDelete = mutation({
	args: {
		clerkId: v.string(),
		lessonId: v.id("lessons"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const lesson = await ctx.db.get(args.lessonId)
		if (!lesson) {
			throw new Error("Lesson not found")
		}

		if (lesson.isDeleted) {
			return
		}

		return ctx.db.patch(args.lessonId, {
			isDeleted: true,
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})

export const reorder = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
		lessonOrders: v.array(
			v.object({
				lessonId: v.id("lessons"),
				order: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		// Verify course exists
		const course = await ctx.db.get(args.courseId)
		if (!course || course.isDeleted) {
			throw new Error("Course not found")
		}

		// Update all lesson orders
		const now = Date.now()
		await Promise.all(
			args.lessonOrders.map(async ({ lessonId, order }) => {
				const lesson = await ctx.db.get(lessonId)
				if (!lesson || lesson.courseId !== args.courseId) {
					throw new Error(`Invalid lesson ${lessonId} for course ${args.courseId}`)
				}
				return ctx.db.patch(lessonId, {
					order,
					updatedAt: now,
				})
			}),
		)
	},
})

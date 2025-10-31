import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

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

export const listByCourse = query({
	args: {
		courseId: v.id("courses"),
		publishedOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const publishedOnly = args.publishedOnly ?? true

		let query = ctx.db
			.query("chapters")
			.withIndex("by_course_and_order", (q) =>
				q.eq("courseId", args.courseId),
			)
			.filter((q) => q.eq(q.field("isDeleted"), false))

		const chapters = await query.collect()

		const filtered = chapters.filter(
			(c) => !publishedOnly || c.isPublished,
		)

		// Sort by order
		return filtered.sort((a, b) => a.order - b.order)
	},
})

export const getById = query({
	args: {
		chapterId: v.id("chapters"),
	},
	handler: async (ctx, args) => {
		const chapter = await ctx.db.get(args.chapterId)

		if (!chapter || chapter.isDeleted) {
			return null
		}

		return chapter
	},
})

export const create = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
		isPublished: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		// Verify course exists
		const course = await ctx.db.get(args.courseId)
		if (!course || course.isDeleted) {
			throw new Error("Course not found")
		}

		const now = Date.now()
		const isPublished = args.isPublished ?? false

		return ctx.db.insert("chapters", {
			courseId: args.courseId,
			title: args.title,
			description: args.description,
			order: args.order,
			isPublished,
			isDeleted: false,
			deletedAt: undefined,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		chapterId: v.id("chapters"),
		patch: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.string()),
			order: v.optional(v.number()),
			isPublished: v.optional(v.boolean()),
		}),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const chapter = await ctx.db.get(args.chapterId)
		if (!chapter) {
			throw new Error("Chapter not found")
		}

		const now = Date.now()
		const next: Partial<typeof chapter> = { updatedAt: now }

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			if (value !== undefined) {
				;(next as Record<string, unknown>)[key as string] = value
			}
		}

		return ctx.db.patch(args.chapterId, next)
	},
})

export const softDelete = mutation({
	args: {
		clerkId: v.string(),
		chapterId: v.id("chapters"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const chapter = await ctx.db.get(args.chapterId)
		if (!chapter) {
			throw new Error("Chapter not found")
		}

		if (chapter.isDeleted) {
			return
		}

		return ctx.db.patch(args.chapterId, {
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
		chapterOrders: v.array(
			v.object({
				chapterId: v.id("chapters"),
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

		// Update all chapter orders
		const now = Date.now()
		await Promise.all(
			args.chapterOrders.map(async ({ chapterId, order }) => {
				const chapter = await ctx.db.get(chapterId)
				if (!chapter || chapter.courseId !== args.courseId) {
					throw new Error(`Invalid chapter ${chapterId} for course ${args.courseId}`)
				}
				return ctx.db.patch(chapterId, {
					order,
					updatedAt: now,
				})
			}),
		)
	},
})

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

const courseFields = {
	title: v.string(),
	slug: v.string(),
	description: v.string(),
	shortDescription: v.optional(v.string()),
	coverAssetId: v.optional(v.id("mediaAssets")),
	level: v.union(
		v.literal("beginner"),
		v.literal("intermediate"),
		v.literal("advanced"),
	),
	duration: v.optional(v.number()),
	category: v.optional(v.string()),
	tags: v.array(v.string()),
	accessLevel: v.union(
		v.literal("public"),
		v.literal("authenticated"),
		v.literal("subscription"),
	),
	requiredTier: v.optional(
		v.union(v.literal("basic"), v.literal("premium")),
	),
	instructorId: v.id("users"),
	isPublished: v.optional(v.boolean()),
	isFeatured: v.optional(v.boolean()),
	publishedAt: v.optional(v.number()),
}

export const list = query({
	args: {
		publishedOnly: v.optional(v.boolean()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50
		const publishedOnly = args.publishedOnly ?? true

		let query = ctx.db
			.query("courses")
			.withIndex("by_is_deleted", (q) => q.eq("isDeleted", false))
			.order("desc")

		const courses = await query.take(limit)

		const filtered = courses.filter(
			(c) => !publishedOnly || c.isPublished,
		)

		// Enrich with cover asset data to avoid N+1 queries
		const enriched = await Promise.all(
			filtered.map(async (course) => {
				let coverAsset = null
				if (course.coverAssetId) {
					coverAsset = await ctx.db.get(course.coverAssetId)
				}

				return {
					...course,
					coverAsset,
				}
			}),
		)

		return enriched
	},
})

export const getBySlug = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx, args) => {
		const course = await ctx.db
			.query("courses")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.filter((q) => q.eq(q.field("isDeleted"), false))
			.first()

		if (!course) {
			return null
		}

		// Enrich with cover asset data
		let coverAsset = null
		if (course.coverAssetId) {
			coverAsset = await ctx.db.get(course.coverAssetId)
		}

		return {
			...course,
			coverAsset,
		}
	},
})

export const getById = query({
	args: {
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
		const course = await ctx.db.get(args.courseId)

		if (!course || course.isDeleted) {
			return null
		}

		// Enrich with cover asset data
		let coverAsset = null
		if (course.coverAssetId) {
			coverAsset = await ctx.db.get(course.coverAssetId)
		}

		return {
			...course,
			coverAsset,
		}
	},
})

export const create = mutation({
	args: {
		...courseFields,
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)
		await ensureUniqueSlug(ctx, "courses", args.slug)

		const now = Date.now()
		const isPublished = args.isPublished ?? false
		const isFeatured = args.isFeatured ?? false
		const publishedAt = isPublished
			? args.publishedAt ?? now
			: undefined

		return ctx.db.insert("courses", {
			title: args.title,
			slug: args.slug,
			description: args.description,
			shortDescription: args.shortDescription,
			coverAssetId: args.coverAssetId,
			level: args.level,
			duration: args.duration,
			category: args.category,
			tags: args.tags,
			accessLevel: args.accessLevel,
			requiredTier: args.requiredTier,
			isPublished,
			isFeatured,
			instructorId: args.instructorId,
			instructorName: undefined,
			enrollmentCount: 0,
			completionCount: 0,
			isDeleted: false,
			deletedAt: undefined,
			publishedAt,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
		patch: v.object({
			title: v.optional(v.string()),
			slug: v.optional(v.string()),
			description: v.optional(v.string()),
			shortDescription: v.optional(v.string()),
			coverAssetId: v.optional(v.id("mediaAssets")),
			level: v.optional(
				v.union(
					v.literal("beginner"),
					v.literal("intermediate"),
					v.literal("advanced"),
				),
			),
			duration: v.optional(v.number()),
			category: v.optional(v.string()),
			tags: v.optional(v.array(v.string())),
			accessLevel: v.optional(
				v.union(
					v.literal("public"),
					v.literal("authenticated"),
					v.literal("subscription"),
				),
			),
			requiredTier: v.optional(
				v.union(v.literal("basic"), v.literal("premium")),
			),
			isPublished: v.optional(v.boolean()),
			isFeatured: v.optional(v.boolean()),
			instructorId: v.optional(v.id("users")),
			instructorName: v.optional(v.string()),
			publishedAt: v.optional(v.number()),
			deletedAt: v.optional(v.number()),
		}),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const course = await ctx.db.get(args.courseId)
		if (!course) {
			throw new Error("Course not found")
		}

		if (args.patch.slug) {
			await ensureUniqueSlug(ctx, "courses", args.patch.slug, args.courseId)
		}

		const now = Date.now()
		const next: Partial<typeof course> = { updatedAt: now }

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			// Skip undefined values and empty strings
			if (value !== undefined && value !== "") {
				;(next as Record<string, unknown>)[key as string] = value
			}
		}

		if (
			typeof args.patch.isPublished === "boolean" &&
			args.patch.isPublished &&
			!next.publishedAt
		) {
			next.publishedAt = args.patch.publishedAt ?? now
		}

		return ctx.db.patch(args.courseId, next)
	},
})

export const softDelete = mutation({
	args: {
		clerkId: v.string(),
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)
		const course = await ctx.db.get(args.courseId)
		if (!course) {
			throw new Error("Course not found")
		}

		if (course.isDeleted) {
			return
		}

		return ctx.db.patch(args.courseId, {
			isDeleted: true,
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})

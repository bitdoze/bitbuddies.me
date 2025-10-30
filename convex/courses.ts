import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { ensureUniqueSlug } from "./utils"

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
		includeUnpublished: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		let q = ctx.db
			.query("courses")
			.withIndex("by_is_deleted", (index) => index.eq("isDeleted", false))

		if (!args.includeUnpublished) {
			q = q.filter((filter) =>
				filter.eq(filter.field("isPublished"), true)
			)
		}

		return q.collect()
	},
})

export const create = mutation({
	args: courseFields,
	handler: async (ctx, args) => {
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
			if (value !== undefined) {
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
		courseId: v.id("courses"),
	},
	handler: async (ctx, args) => {
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

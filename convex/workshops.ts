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

const writeFields = {
	title: v.string(),
	slug: v.string(),
	description: v.string(),
	shortDescription: v.optional(v.string()),
	coverAssetId: v.optional(v.id("mediaAssets")),
	content: v.string(),
	duration: v.optional(v.number()),
	level: v.union(
		v.literal("beginner"),
		v.literal("intermediate"),
		v.literal("advanced"),
	),
	category: v.optional(v.string()),
	tags: v.array(v.string()),
	isLive: v.boolean(),
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number()),
	maxParticipants: v.optional(v.number()),
	videoProvider: v.optional(
		v.union(v.literal("youtube"), v.literal("bunny")),
	),
	videoId: v.optional(v.string()),
	videoUrl: v.optional(v.string()),
	accessLevel: v.union(
		v.literal("public"),
		v.literal("authenticated"),
		v.literal("subscription"),
	),
	requiredTier: v.optional(
		v.union(v.literal("basic"), v.literal("premium")),
	),
	isPublished: v.optional(v.boolean()),
	isFeatured: v.optional(v.boolean()),
	instructorId: v.id("users"),
	instructorName: v.optional(v.string()),
	publishedAt: v.optional(v.number()),
	currentParticipants: v.optional(v.number()),
}

export const create = mutation({
	args: {
		...writeFields,
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)
		await ensureUniqueSlug(ctx, "workshops", args.slug)

		const now = Date.now()
		const isPublished = args.isPublished ?? false
		const isFeatured = args.isFeatured ?? false
		const currentParticipants = args.currentParticipants ?? 0

		if (
			typeof args.maxParticipants === "number" &&
			currentParticipants > args.maxParticipants
		) {
			throw new Error("Current participants cannot exceed maximum")
		}

		if (
			typeof args.startDate === "number" &&
			typeof args.endDate === "number" &&
			args.endDate < args.startDate
		) {
			throw new Error("endDate cannot be earlier than startDate")
		}

		return ctx.db.insert("workshops", {
			title: args.title,
			slug: args.slug,
			description: args.description,
			shortDescription: args.shortDescription,
			coverAssetId: args.coverAssetId,
			content: args.content,
			duration: args.duration,
			level: args.level,
			category: args.category,
			tags: args.tags,
			isLive: args.isLive,
			startDate: args.startDate,
			endDate: args.endDate,
			maxParticipants: args.maxParticipants,
			currentParticipants,
			videoProvider: args.videoProvider,
			videoId: args.videoId,
			videoUrl: args.videoUrl,
			accessLevel: args.accessLevel,
			requiredTier: args.requiredTier,
			isPublished,
			isFeatured,
			instructorId: args.instructorId,
			instructorName: args.instructorName,
			enrollmentCount: 0,
			isDeleted: false,
			deletedAt: undefined,
			publishedAt: isPublished
				? args.publishedAt ?? now
				: undefined,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		workshopId: v.id("workshops"),
		patch: v.object({
			title: v.optional(v.string()),
			slug: v.optional(v.string()),
			description: v.optional(v.string()),
			shortDescription: v.optional(v.string()),
			coverAssetId: v.optional(v.id("mediaAssets")),
			content: v.optional(v.string()),
			duration: v.optional(v.number()),
			level: v.optional(
				v.union(
					v.literal("beginner"),
					v.literal("intermediate"),
					v.literal("advanced"),
				),
			),
			category: v.optional(v.string()),
			tags: v.optional(v.array(v.string())),
			isLive: v.optional(v.boolean()),
			startDate: v.optional(v.number()),
			endDate: v.optional(v.number()),
			maxParticipants: v.optional(v.number()),
			currentParticipants: v.optional(v.number()),
			videoProvider: v.optional(
				v.union(v.literal("youtube"), v.literal("bunny")),
			),
			videoId: v.optional(v.string()),
			videoUrl: v.optional(v.string()),
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

		const workshop = await ctx.db.get(args.workshopId)
		if (!workshop) {
			throw new Error("Workshop not found")
		}

		if (args.patch.slug) {
			await ensureUniqueSlug(
				ctx,
				"workshops",
				args.patch.slug,
				args.workshopId,
			)
		}

		const now = Date.now()
		const next: Partial<typeof workshop> = { updatedAt: now }

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			// Skip undefined values and empty strings
			if (value !== undefined && value !== "") {
				;(next as Record<string, unknown>)[key as string] = value
			}
		}

		if (
			typeof next.startDate === "number" &&
			typeof next.endDate === "number" &&
			next.endDate < next.startDate
		) {
			throw new Error("endDate cannot be earlier than startDate")
		}

		if (
			typeof next.maxParticipants === "number" &&
			typeof next.currentParticipants === "number" &&
			next.currentParticipants > next.maxParticipants
		) {
			throw new Error("Current participants cannot exceed maximum")
		}

		if (
			typeof args.patch.isPublished === "boolean" &&
			args.patch.isPublished &&
			!next.publishedAt
		) {
			next.publishedAt = args.patch.publishedAt ?? now
		}

		return ctx.db.patch(args.workshopId, next)
	},
})

export const softDelete = mutation({
	args: {
		clerkId: v.string(),
		workshopId: v.id("workshops"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)
		const workshop = await ctx.db.get(args.workshopId)
		if (!workshop) {
			throw new Error("Workshop not found")
		}

		if (workshop.isDeleted) {
			return
		}

		return ctx.db.patch(args.workshopId, {
			isDeleted: true,
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})

export const list = query({
	args: {
		limit: v.optional(v.number()),
		publishedOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50
		const publishedOnly = args.publishedOnly ?? true

		let query = ctx.db
			.query("workshops")
			.withIndex("by_is_deleted", (q) => q.eq("isDeleted", false))
			.order("desc")

		const workshops = await query.take(limit)

		const filtered = workshops.filter(
			(w) => !publishedOnly || w.isPublished,
		)

		// Enrich with cover asset data to avoid N+1 queries
		const enriched = await Promise.all(
			filtered.map(async (workshop) => {
				let coverAsset = null
				if (workshop.coverAssetId) {
					coverAsset = await ctx.db.get(workshop.coverAssetId)
				}

				return {
					...workshop,
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
		const workshop = await ctx.db
			.query("workshops")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.filter((q) => q.eq(q.field("isDeleted"), false))
			.first()

		if (!workshop) {
			return null
		}

		// Enrich with cover asset data
		let coverAsset = null
		if (workshop.coverAssetId) {
			coverAsset = await ctx.db.get(workshop.coverAssetId)
		}

		return {
			...workshop,
			coverAsset,
		}
	},
})

export const getById = query({
	args: {
		workshopId: v.id("workshops"),
	},
	handler: async (ctx, args) => {
		const workshop = await ctx.db.get(args.workshopId)

		if (!workshop || workshop.isDeleted) {
			return null
		}

		// Enrich with cover asset data
		let coverAsset = null
		if (workshop.coverAssetId) {
			coverAsset = await ctx.db.get(workshop.coverAssetId)
		}

		return {
			...workshop,
			coverAsset,
		}
	},
})

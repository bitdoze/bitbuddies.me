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

/**
 * Generate an upload URL for image uploads
 * This can be called by authenticated users
 */
export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl()
	},
})

/**
 * Create a media asset record after file upload
 */
export const create = mutation({
	args: {
		clerkId: v.string(),
		storageId: v.id("_storage"),
		mimeType: v.string(),
		filesize: v.number(),
		assetType: v.union(v.literal("image"), v.literal("attachment")),
		altText: v.optional(v.string()),
		caption: v.optional(v.string()),
		createdBy: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const now = Date.now()

		// Get the URL for the uploaded file
		const url = await ctx.storage.getUrl(args.storageId)

		return await ctx.db.insert("mediaAssets", {
			storageId: args.storageId,
			url: url ?? undefined,
			mimeType: args.mimeType,
			filesize: args.filesize,
			assetType: args.assetType,
			altText: args.altText,
			caption: args.caption,
			createdBy: args.createdBy,
			createdAt: now,
			updatedAt: now,
		})
	},
})

/**
 * Get a media asset by ID with URL
 */
export const getById = query({
	args: {
		assetId: v.id("mediaAssets"),
	},
	handler: async (ctx, args) => {
		const asset = await ctx.db.get(args.assetId)
		if (!asset) {
			return null
		}

		// Generate URL from storage
		const url = await ctx.storage.getUrl(asset.storageId)

		return {
			...asset,
			url: url ?? undefined,
		}
	},
})

/**
 * Get URL for a media asset
 */
export const getUrl = query({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId)
	},
})

/**
 * List all media assets
 */
export const list = query({
	args: {
		assetType: v.optional(v.union(v.literal("image"), v.literal("attachment"))),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 100

		let assets: any[] = []

		if (args.assetType) {
			const assetType = args.assetType // TypeScript narrowing
			assets = await ctx.db
				.query("mediaAssets")
				.withIndex("by_asset_type", (q) => q.eq("assetType", assetType))
				.order("desc")
				.take(limit)
		} else {
			assets = await ctx.db
				.query("mediaAssets")
				.order("desc")
				.take(limit)
		}

		// Enrich with URLs
		const enriched = await Promise.all(
			assets.map(async (asset) => {
				const url = await ctx.storage.getUrl(asset.storageId)
				return {
					...asset,
					url: url ?? undefined,
				}
			})
		)

		return enriched
	},
})

/**
 * Update media asset metadata
 */
export const update = mutation({
	args: {
		clerkId: v.string(),
		assetId: v.id("mediaAssets"),
		altText: v.optional(v.string()),
		caption: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const asset = await ctx.db.get(args.assetId)
		if (!asset) {
			throw new Error("Asset not found")
		}

		await ctx.db.patch(args.assetId, {
			altText: args.altText,
			caption: args.caption,
			updatedAt: Date.now(),
		})
	},
})

/**
 * Delete a media asset
 */
export const remove = mutation({
	args: {
		clerkId: v.string(),
		assetId: v.id("mediaAssets"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const asset = await ctx.db.get(args.assetId)
		if (!asset) {
			throw new Error("Asset not found")
		}

		// Delete from storage
		await ctx.storage.delete(asset.storageId)

		// Delete from database
		await ctx.db.delete(args.assetId)
	},
})

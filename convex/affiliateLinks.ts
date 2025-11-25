import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { requireAdmin } from "./utils"

export const create = mutation({
	args: {
		clerkId: v.string(),
		slug: v.string(),
		destinationUrl: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		categoryId: v.optional(v.id("linkCategories")),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const admin = await requireAdmin(ctx, args.clerkId)

		// Check for unique slug
		const existing = await ctx.db
			.query("affiliateLinks")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first()

		if (existing) {
			throw new Error(`Link with slug "${args.slug}" already exists`)
		}

		// Validate category exists if provided
		if (args.categoryId) {
			const category = await ctx.db.get(args.categoryId)
			if (!category) {
				throw new Error("Category not found")
			}
		}

		const now = Date.now()
		return ctx.db.insert("affiliateLinks", {
			slug: args.slug,
			destinationUrl: args.destinationUrl,
			name: args.name,
			description: args.description,
			categoryId: args.categoryId,
			isActive: args.isActive ?? true,
			clickCount: 0,
			createdBy: admin._id,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		linkId: v.id("affiliateLinks"),
		slug: v.optional(v.string()),
		destinationUrl: v.optional(v.string()),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		categoryId: v.optional(v.id("linkCategories")),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const link = await ctx.db.get(args.linkId)
		if (!link) {
			throw new Error("Link not found")
		}

		// Check for unique slug if changing
		if (args.slug !== undefined && args.slug !== link.slug) {
			const newSlug = args.slug
			const existing = await ctx.db
				.query("affiliateLinks")
				.withIndex("by_slug", (q) => q.eq("slug", newSlug))
				.first()

			if (existing) {
				throw new Error(`Link with slug "${newSlug}" already exists`)
			}
		}

		// Validate category exists if provided
		if (args.categoryId) {
			const category = await ctx.db.get(args.categoryId)
			if (!category) {
				throw new Error("Category not found")
			}
		}

		const updates: Partial<typeof link> = { updatedAt: Date.now() }
		if (args.slug !== undefined) updates.slug = args.slug
		if (args.destinationUrl !== undefined) updates.destinationUrl = args.destinationUrl
		if (args.name !== undefined) updates.name = args.name
		if (args.description !== undefined) updates.description = args.description
		if (args.categoryId !== undefined) updates.categoryId = args.categoryId
		if (args.isActive !== undefined) updates.isActive = args.isActive

		return ctx.db.patch(args.linkId, updates)
	},
})

export const remove = mutation({
	args: {
		clerkId: v.string(),
		linkId: v.id("affiliateLinks"),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const link = await ctx.db.get(args.linkId)
		if (!link) {
			throw new Error("Link not found")
		}

		// Delete all click records for this link
		const clicks = await ctx.db
			.query("linkClicks")
			.withIndex("by_link_id", (q) => q.eq("linkId", args.linkId))
			.collect()

		for (const click of clicks) {
			await ctx.db.delete(click._id)
		}

		return ctx.db.delete(args.linkId)
	},
})

export const list = query({
	args: {
		categoryId: v.optional(v.id("linkCategories")),
		activeOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		let links

		if (args.categoryId) {
			links = await ctx.db
				.query("affiliateLinks")
				.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
				.collect()
		} else {
			links = await ctx.db.query("affiliateLinks").order("desc").collect()
		}

		// Filter by active status if requested
		if (args.activeOnly) {
			links = links.filter((link) => link.isActive)
		}

		// Enrich with category data
		const enriched = await Promise.all(
			links.map(async (link) => {
				let category = null
				if (link.categoryId) {
					category = await ctx.db.get(link.categoryId)
				}
				return { ...link, category }
			}),
		)

		return enriched
	},
})

export const getById = query({
	args: { linkId: v.id("affiliateLinks") },
	handler: async (ctx, args) => {
		const link = await ctx.db.get(args.linkId)
		if (!link) return null

		let category = null
		if (link.categoryId) {
			category = await ctx.db.get(link.categoryId)
		}

		return { ...link, category }
	},
})

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return ctx.db
			.query("affiliateLinks")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first()
	},
})

export const trackClick = mutation({
	args: {
		slug: v.string(),
		referrer: v.optional(v.string()),
		userAgent: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const link = await ctx.db
			.query("affiliateLinks")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first()

		if (!link || !link.isActive) {
			return null
		}

		// Record the click
		await ctx.db.insert("linkClicks", {
			linkId: link._id,
			referrer: args.referrer,
			userAgent: args.userAgent,
			clickedAt: Date.now(),
		})

		// Increment click count
		await ctx.db.patch(link._id, {
			clickCount: link.clickCount + 1,
		})

		return link.destinationUrl
	},
})

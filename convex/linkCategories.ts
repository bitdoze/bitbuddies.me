import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { requireAdmin } from "./utils"

export const create = mutation({
	args: {
		clerkId: v.string(),
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const existing = await ctx.db
			.query("linkCategories")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first()

		if (existing) {
			throw new Error(`Category with slug "${args.slug}" already exists`)
		}

		const now = Date.now()
		return ctx.db.insert("linkCategories", {
			name: args.name,
			slug: args.slug,
			description: args.description,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		categoryId: v.id("linkCategories"),
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const category = await ctx.db.get(args.categoryId)
		if (!category) {
			throw new Error("Category not found")
		}

		if (args.slug !== undefined && args.slug !== category.slug) {
			const newSlug = args.slug
			const existing = await ctx.db
				.query("linkCategories")
				.withIndex("by_slug", (q) => q.eq("slug", newSlug))
				.first()

			if (existing) {
				throw new Error(`Category with slug "${newSlug}" already exists`)
			}
		}

		const updates: Partial<typeof category> = { updatedAt: Date.now() }
		if (args.name !== undefined) updates.name = args.name
		if (args.slug !== undefined) updates.slug = args.slug
		if (args.description !== undefined) updates.description = args.description

		return ctx.db.patch(args.categoryId, updates)
	},
})

export const remove = mutation({
	args: {
		clerkId: v.string(),
		categoryId: v.id("linkCategories"),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const category = await ctx.db.get(args.categoryId)
		if (!category) {
			throw new Error("Category not found")
		}

		// Check if any links use this category
		const linksInCategory = await ctx.db
			.query("affiliateLinks")
			.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
			.first()

		if (linksInCategory) {
			throw new Error("Cannot delete category with existing links")
		}

		return ctx.db.delete(args.categoryId)
	},
})

export const list = query({
	args: {},
	handler: async (ctx) => {
		return ctx.db.query("linkCategories").order("asc").collect()
	},
})

export const getById = query({
	args: { categoryId: v.id("linkCategories") },
	handler: async (ctx, args) => {
		return ctx.db.get(args.categoryId)
	},
})

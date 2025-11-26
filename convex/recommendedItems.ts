import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { requireAdmin } from "./utils"
import type { Doc } from "./_generated/dataModel"

export type RecommendedItemWithSection = Doc<"recommendedItems"> & {
	section: Doc<"recommendedSections"> | null
}

export type RecommendedSectionWithItems = Doc<"recommendedSections"> & {
	items: Doc<"recommendedItems">[]
}

// ============================================================================
// SECTIONS QUERIES
// ============================================================================

export const listSections = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("recommendedSections")
			.withIndex("by_order")
			.collect()
	},
})

export const listActiveSections = query({
	args: {},
	handler: async (ctx) => {
		const sections = await ctx.db
			.query("recommendedSections")
			.withIndex("by_is_active", (q) => q.eq("isActive", true))
			.collect()

		return sections.sort((a, b) => a.order - b.order)
	},
})

export const listActiveSectionsWithItems = query({
	args: {},
	handler: async (ctx): Promise<RecommendedSectionWithItems[]> => {
		const sections = await ctx.db
			.query("recommendedSections")
			.withIndex("by_is_active", (q) => q.eq("isActive", true))
			.collect()

		const sortedSections = sections.sort((a, b) => a.order - b.order)

		return await Promise.all(
			sortedSections.map(async (section) => {
				const items = await ctx.db
					.query("recommendedItems")
					.withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
					.collect()

				const activeItems = items
					.filter((item) => item.isActive)
					.sort((a, b) => a.order - b.order)

				return { ...section, items: activeItems }
			}),
		)
	},
})

export const getSection = query({
	args: { sectionId: v.id("recommendedSections") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.sectionId)
	},
})

// ============================================================================
// SECTIONS MUTATIONS
// ============================================================================

export const createSection = mutation({
	args: {
		clerkId: v.string(),
		title: v.string(),
		slug: v.string(),
		order: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const existing = await ctx.db
			.query("recommendedSections")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first()

		if (existing) {
			throw new Error(`Section with slug "${args.slug}" already exists`)
		}

		const sections = await ctx.db.query("recommendedSections").collect()
		const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), 0)

		const now = Date.now()
		return await ctx.db.insert("recommendedSections", {
			title: args.title,
			slug: args.slug,
			order: args.order ?? maxOrder + 1,
			isActive: args.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const updateSection = mutation({
	args: {
		clerkId: v.string(),
		sectionId: v.id("recommendedSections"),
		title: v.optional(v.string()),
		slug: v.optional(v.string()),
		order: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const section = await ctx.db.get(args.sectionId)
		if (!section) {
			throw new Error("Section not found")
		}

		if (args.slug && args.slug !== section.slug) {
			const newSlug = args.slug
			const existing = await ctx.db
				.query("recommendedSections")
				.withIndex("by_slug", (q) => q.eq("slug", newSlug))
				.first()

			if (existing) {
				throw new Error(`Section with slug "${newSlug}" already exists`)
			}
		}

		const updates: Partial<Doc<"recommendedSections">> = {
			updatedAt: Date.now(),
		}

		if (args.title !== undefined) updates.title = args.title
		if (args.slug !== undefined) updates.slug = args.slug
		if (args.order !== undefined) updates.order = args.order
		if (args.isActive !== undefined) updates.isActive = args.isActive

		await ctx.db.patch(args.sectionId, updates)
	},
})

export const deleteSection = mutation({
	args: {
		clerkId: v.string(),
		sectionId: v.id("recommendedSections"),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const items = await ctx.db
			.query("recommendedItems")
			.withIndex("by_section_id", (q) => q.eq("sectionId", args.sectionId))
			.collect()

		for (const item of items) {
			await ctx.db.delete(item._id)
		}

		await ctx.db.delete(args.sectionId)
	},
})

// ============================================================================
// ITEMS QUERIES
// ============================================================================

export const listItems = query({
	args: { sectionId: v.optional(v.id("recommendedSections")) },
	handler: async (ctx, args): Promise<RecommendedItemWithSection[]> => {
		let items: Doc<"recommendedItems">[]

		if (args.sectionId) {
			const sectionId = args.sectionId
			items = await ctx.db
				.query("recommendedItems")
				.withIndex("by_section_and_order", (q) => q.eq("sectionId", sectionId))
				.collect()
		} else {
			items = await ctx.db.query("recommendedItems").collect()
		}

		return await Promise.all(
			items.map(async (item) => {
				const section = await ctx.db.get(item.sectionId)
				return { ...item, section }
			}),
		)
	},
})

export const getItem = query({
	args: { itemId: v.id("recommendedItems") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.itemId)
	},
})

// ============================================================================
// ITEMS MUTATIONS
// ============================================================================

const itemWriteFields = {
	title: v.string(),
	description: v.string(),
	category: v.string(),
	badge: v.optional(v.string()),
	badgeColor: v.optional(
		v.union(
			v.literal("red"),
			v.literal("blue"),
			v.literal("green"),
			v.literal("purple"),
		),
	),
	imageUrl: v.string(),
	ctaText: v.string(),
	ctaUrl: v.string(),
	isAffiliate: v.boolean(),
}

export const createItem = mutation({
	args: {
		clerkId: v.string(),
		sectionId: v.id("recommendedSections"),
		...itemWriteFields,
		order: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const section = await ctx.db.get(args.sectionId)
		if (!section) {
			throw new Error("Section not found")
		}

		const items = await ctx.db
			.query("recommendedItems")
			.withIndex("by_section_id", (q) => q.eq("sectionId", args.sectionId))
			.collect()
		const maxOrder = items.reduce((max, i) => Math.max(max, i.order), 0)

		const now = Date.now()
		return await ctx.db.insert("recommendedItems", {
			sectionId: args.sectionId,
			title: args.title,
			description: args.description,
			category: args.category,
			badge: args.badge,
			badgeColor: args.badgeColor,
			imageUrl: args.imageUrl,
			ctaText: args.ctaText,
			ctaUrl: args.ctaUrl,
			isAffiliate: args.isAffiliate,
			order: args.order ?? maxOrder + 1,
			isActive: args.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const updateItem = mutation({
	args: {
		clerkId: v.string(),
		itemId: v.id("recommendedItems"),
		sectionId: v.optional(v.id("recommendedSections")),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		category: v.optional(v.string()),
		badge: v.optional(v.string()),
		badgeColor: v.optional(
			v.union(
				v.literal("red"),
				v.literal("blue"),
				v.literal("green"),
				v.literal("purple"),
			),
		),
		imageUrl: v.optional(v.string()),
		ctaText: v.optional(v.string()),
		ctaUrl: v.optional(v.string()),
		isAffiliate: v.optional(v.boolean()),
		order: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const item = await ctx.db.get(args.itemId)
		if (!item) {
			throw new Error("Item not found")
		}

		if (args.sectionId) {
			const section = await ctx.db.get(args.sectionId)
			if (!section) {
				throw new Error("Section not found")
			}
		}

		const updates: Partial<Doc<"recommendedItems">> = {
			updatedAt: Date.now(),
		}

		if (args.sectionId !== undefined) updates.sectionId = args.sectionId
		if (args.title !== undefined) updates.title = args.title
		if (args.description !== undefined) updates.description = args.description
		if (args.category !== undefined) updates.category = args.category
		if (args.badge !== undefined) updates.badge = args.badge
		if (args.badgeColor !== undefined) updates.badgeColor = args.badgeColor
		if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl
		if (args.ctaText !== undefined) updates.ctaText = args.ctaText
		if (args.ctaUrl !== undefined) updates.ctaUrl = args.ctaUrl
		if (args.isAffiliate !== undefined) updates.isAffiliate = args.isAffiliate
		if (args.order !== undefined) updates.order = args.order
		if (args.isActive !== undefined) updates.isActive = args.isActive

		await ctx.db.patch(args.itemId, updates)
	},
})

export const deleteItem = mutation({
	args: {
		clerkId: v.string(),
		itemId: v.id("recommendedItems"),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const item = await ctx.db.get(args.itemId)
		if (!item) {
			throw new Error("Item not found")
		}

		await ctx.db.delete(args.itemId)
	},
})

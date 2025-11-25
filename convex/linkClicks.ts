import { query } from "./_generated/server"
import { v } from "convex/values"
import { requireAdmin } from "./utils"

export const getStats = query({
	args: {
		clerkId: v.string(),
		linkId: v.optional(v.id("affiliateLinks")),
		referrer: v.optional(v.string()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		let allClicks
		if (args.linkId) {
			allClicks = await ctx.db
				.query("linkClicks")
				.withIndex("by_link_id", (q) => q.eq("linkId", args.linkId!))
				.order("desc")
				.collect()
		} else {
			allClicks = await ctx.db
				.query("linkClicks")
				.order("desc")
				.collect()
		}

		// Apply filters
		let filteredClicks = allClicks

		if (args.referrer) {
			filteredClicks = filteredClicks.filter(
				(click) => click.referrer?.toLowerCase().includes(args.referrer!.toLowerCase())
			)
		}

		if (args.startDate) {
			filteredClicks = filteredClicks.filter(
				(click) => click.clickedAt >= args.startDate!
			)
		}

		if (args.endDate) {
			filteredClicks = filteredClicks.filter(
				(click) => click.clickedAt <= args.endDate!
			)
		}

		// Enrich with link data
		const enrichedClicks = await Promise.all(
			filteredClicks.map(async (click) => {
				const link = await ctx.db.get(click.linkId)
				return {
					...click,
					link: link ? { name: link.name, slug: link.slug } : null,
				}
			}),
		)

		return enrichedClicks
	},
})

export const getClicksByDate = query({
	args: {
		clerkId: v.string(),
		linkId: v.optional(v.id("affiliateLinks")),
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const daysBack = args.days ?? 30
		const startDate = Date.now() - daysBack * 24 * 60 * 60 * 1000

		let clicks
		if (args.linkId) {
			clicks = await ctx.db
				.query("linkClicks")
				.withIndex("by_link_id", (q) => q.eq("linkId", args.linkId!))
				.order("desc")
				.collect()
		} else {
			clicks = await ctx.db
				.query("linkClicks")
				.order("desc")
				.collect()
		}

		const recentClicks = clicks.filter((click) => click.clickedAt >= startDate)

		// Group clicks by date
		const clicksByDate: Record<string, number> = {}

		for (const click of recentClicks) {
			const date = new Date(click.clickedAt).toISOString().split("T")[0]
			clicksByDate[date] = (clicksByDate[date] || 0) + 1
		}

		// Convert to array sorted by date
		const result = Object.entries(clicksByDate)
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => a.date.localeCompare(b.date))

		return result
	},
})

export const getClicksByReferrer = query({
	args: {
		clerkId: v.string(),
		linkId: v.optional(v.id("affiliateLinks")),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		let clicks
		if (args.linkId) {
			clicks = await ctx.db
				.query("linkClicks")
				.withIndex("by_link_id", (q) => q.eq("linkId", args.linkId!))
				.collect()
		} else {
			clicks = await ctx.db
				.query("linkClicks")
				.collect()
		}

		// Apply date filters
		if (args.startDate) {
			clicks = clicks.filter((click) => click.clickedAt >= args.startDate!)
		}

		if (args.endDate) {
			clicks = clicks.filter((click) => click.clickedAt <= args.endDate!)
		}

		// Group by referrer
		const clicksByReferrer: Record<string, number> = {}

		for (const click of clicks) {
			const referrer = click.referrer || "Direct"
			clicksByReferrer[referrer] = (clicksByReferrer[referrer] || 0) + 1
		}

		// Convert to sorted array
		const result = Object.entries(clicksByReferrer)
			.map(([referrer, count]) => ({ referrer, count }))
			.sort((a, b) => b.count - a.count)

		return result
	},
})

export const getSummary = query({
	args: {
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const links = await ctx.db.query("affiliateLinks").collect()
		const totalLinks = links.length
		const activeLinks = links.filter((link) => link.isActive).length
		const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)

		// Get clicks in last 24 hours
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
		const recentClicks = await ctx.db
			.query("linkClicks")
			.withIndex("by_clicked_at")
			.order("desc")
			.collect()

		const clicksLast24h = recentClicks.filter(
			(click) => click.clickedAt >= oneDayAgo
		).length

		// Get top performing links
		const topLinks = links
			.filter((link) => link.clickCount > 0)
			.sort((a, b) => b.clickCount - a.clickCount)
			.slice(0, 5)

		return {
			totalLinks,
			activeLinks,
			totalClicks,
			clicksLast24h,
			topLinks,
		}
	},
})

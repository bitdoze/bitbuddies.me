import { mutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { v } from "convex/values"

const statusEnum = v.union(
	v.literal("active"),
	v.literal("cancelled"),
	v.literal("expired"),
	v.literal("trial"),
)

const tierEnum = v.union(
	v.literal("free"),
	v.literal("basic"),
	v.literal("premium"),
)

const logHistory = async (
	ctx: MutationCtx,
	args: {
		userId: Id<"users">
		subscriptionId: Id<"subscriptions">
		tier: "free" | "basic" | "premium"
		status: "active" | "cancelled" | "expired" | "trial"
		event: "created" | "updated" | "cancelled" | "expired" | "renewed"
		amount?: number
		currency?: string
		eventDate: number
	},
) => {
	await ctx.db.insert("subscriptionHistory", {
		userId: args.userId,
		subscriptionId: args.subscriptionId,
		tier: args.tier,
		status: args.status,
		event: args.event,
		amount: args.amount,
		currency: args.currency,
		eventDate: args.eventDate,
		createdAt: Date.now(),
	})
}

export const upsert = mutation({
	args: {
		subscriptionId: v.optional(v.id("subscriptions")),
		userId: v.id("users"),
		tier: tierEnum,
		status: statusEnum,
		stripeCustomerId: v.optional(v.string()),
		stripeSubscriptionId: v.optional(v.string()),
		priceId: v.optional(v.string()),
		currency: v.optional(v.string()),
		amount: v.optional(v.number()),
		startDate: v.number(),
		endDate: v.optional(v.number()),
		trialEndDate: v.optional(v.number()),
		cancelledAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const now = Date.now()

		if (args.status === "active") {
			const existingActive = await ctx.db
				.query("subscriptions")
				.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
				.filter((q) => q.eq(q.field("status"), "active"))
				.first()

			if (
				existingActive &&
				(!args.subscriptionId ||
					existingActive._id !== args.subscriptionId)
			) {
				throw new Error("User already has an active subscription")
			}
		}

		if (args.subscriptionId) {
			const existing = await ctx.db.get(args.subscriptionId)
			if (!existing) {
				throw new Error("Subscription not found")
			}

			await ctx.db.patch(args.subscriptionId, {
				userId: args.userId,
				tier: args.tier,
				status: args.status,
				stripeCustomerId: args.stripeCustomerId,
				stripeSubscriptionId: args.stripeSubscriptionId,
				priceId: args.priceId,
				currency: args.currency,
				amount: args.amount,
				startDate: args.startDate,
				endDate: args.endDate,
				trialEndDate: args.trialEndDate,
				cancelledAt: args.cancelledAt,
				updatedAt: now,
			})

			await logHistory(ctx, {
				userId: args.userId,
				subscriptionId: args.subscriptionId,
				tier: args.tier,
				status: args.status,
				event: "updated",
				amount: args.amount,
				currency: args.currency,
				eventDate: now,
			})

			return args.subscriptionId
		}

		const subscriptionId = await ctx.db.insert("subscriptions", {
			userId: args.userId,
			tier: args.tier,
			status: args.status,
			stripeCustomerId: args.stripeCustomerId,
			stripeSubscriptionId: args.stripeSubscriptionId,
			priceId: args.priceId,
			currency: args.currency,
			amount: args.amount,
			startDate: args.startDate,
			endDate: args.endDate,
			trialEndDate: args.trialEndDate,
			cancelledAt: args.cancelledAt,
			createdAt: now,
			updatedAt: now,
		})

		await logHistory(ctx, {
			userId: args.userId,
			subscriptionId,
			tier: args.tier,
			status: args.status,
			event: "created",
			amount: args.amount,
			currency: args.currency,
			eventDate: now,
		})

		return subscriptionId
	},
})

export const cancel = mutation({
	args: {
		subscriptionId: v.id("subscriptions"),
		cancelledAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const subscription = await ctx.db.get(args.subscriptionId)
		if (!subscription) {
			throw new Error("Subscription not found")
		}

		const now = Date.now()
		const cancelledAt = args.cancelledAt ?? now

		await ctx.db.patch(args.subscriptionId, {
			status: "cancelled",
			cancelledAt,
			endDate: cancelledAt,
			updatedAt: now,
		})

		await logHistory(ctx, {
			userId: subscription.userId,
			subscriptionId: args.subscriptionId,
			tier: subscription.tier,
			status: "cancelled",
			event: "cancelled",
			amount: subscription.amount,
			currency: subscription.currency,
			eventDate: now,
		})
	},
})

import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Get or create a user by Clerk ID
 * This function is called when a user signs in
 */
export const getOrCreateUser = mutation({
	args: {
		clerkId: v.string(),
		email: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if user already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		if (existingUser) {
			// Update last login time
			await ctx.db.patch(existingUser._id, {
				lastLoginAt: Date.now(),
				updatedAt: Date.now(),
			})
			return existingUser._id
		}

		// Create new user
		const now = Date.now()
		const userId = await ctx.db.insert("users", {
			clerkId: args.clerkId,
			email: args.email,
			role: "user",
			isActive: true,
			lastLoginAt: now,
			createdAt: now,
			updatedAt: now,
		})

		// Create user profile
		await ctx.db.insert("profiles", {
			userId,
			firstName: args.firstName,
			lastName: args.lastName,
			displayName: args.firstName
				? `${args.firstName}${args.lastName ? ` ${args.lastName}` : ""}`
				: undefined,
			avatarUrl: args.imageUrl,
			emailNotifications: true,
			updatedAt: now,
		})

		return userId
	},
})

/**
 * Get current user by Clerk ID
 */
export const getCurrentUser = query({
	args: {
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		return user
	},
})

/**
 * Get user with profile by Clerk ID
 */
export const getUserWithProfile = query({
	args: {
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first()

		if (!user) {
			return null
		}

		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", user._id))
			.first()

		return {
			...user,
			profile,
		}
	},
})

/**
 * Get user by ID
 */
export const getById = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId)
	},
})

/**
 * Update user role (admin only)
 */
export const updateRole = mutation({
	args: {
		userId: v.id("users"),
		role: v.union(v.literal("user"), v.literal("admin")),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, {
			role: args.role,
			updatedAt: Date.now(),
		})
	},
})

/**
 * Set user role by Clerk ID (admin only)
 * Requires the caller to be an admin to change any user's role
 */
export const setUserRole = mutation({
	args: {
		callerClerkId: v.string(),
		targetClerkId: v.string(),
		role: v.union(v.literal("user"), v.literal("admin")),
	},
	handler: async (ctx, args) => {
		// Verify caller is admin
		const caller = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.callerClerkId))
			.first()

		if (!caller) {
			throw new Error("Caller not found")
		}

		if (caller.role !== "admin") {
			throw new Error("Admin access required")
		}

		// Find target user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.targetClerkId))
			.first()

		if (!user) {
			throw new Error("User not found")
		}

		await ctx.db.patch(user._id, {
			role: args.role,
			updatedAt: Date.now(),
		})

		return user._id
	},
})

/**
 * List all users (for debugging)
 */
export const listAll = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").collect()
	},
})

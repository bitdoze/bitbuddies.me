import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Submit a contact message
 */
export const create = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		subject: v.string(),
		message: v.string(),
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(args.email)) {
			throw new Error("Invalid email format");
		}

		// Validate required fields
		if (!args.name.trim() || !args.subject.trim() || !args.message.trim()) {
			throw new Error("All fields are required");
		}

		// Create the contact message
		const messageId = await ctx.db.insert("contactMessages", {
			name: args.name.trim(),
			email: args.email.trim().toLowerCase(),
			subject: args.subject.trim(),
			message: args.message.trim(),
			status: "new",
			emailSent: false,
			userId: args.userId,
			createdAt: now,
			updatedAt: now,
		});

		// Send email notification via Convex action
		// We'll schedule this as an action to handle SMTP
		await ctx.scheduler.runAfter(0, internal.contactMessagesActions.sendEmail, {
			messageId,
		});

		return messageId;
	},
});

/**
 * List all contact messages (admin only)
 */
export const list = query({
	args: {
		status: v.optional(
			v.union(
				v.literal("new"),
				v.literal("read"),
				v.literal("replied"),
				v.literal("archived"),
			),
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		let messages;

		if (args.status !== undefined) {
			messages = await ctx.db
				.query("contactMessages")
				.withIndex("by_status", (q) => q.eq("status", args.status as "new" | "read" | "replied" | "archived"))
				.order("desc")
				.take(args.limit ?? 100);
		} else {
			messages = await ctx.db
				.query("contactMessages")
				.withIndex("by_created_at")
				.order("desc")
				.take(args.limit ?? 100);
		}

		return messages;
	},
});

/**
 * Get a single contact message by ID (admin only)
 */
export const getById = query({
	args: {
		id: v.id("contactMessages"),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id);
		return message;
	},
});

/**
 * Update message status (admin only)
 */
export const updateStatus = mutation({
	args: {
		id: v.id("contactMessages"),
		status: v.union(
			v.literal("new"),
			v.literal("read"),
			v.literal("replied"),
			v.literal("archived"),
		),
		adminNotes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id);
		if (!message) {
			throw new Error("Message not found");
		}

		const updates: Record<string, unknown> = {
			status: args.status,
			updatedAt: Date.now(),
		};

		if (args.adminNotes !== undefined) {
			updates.adminNotes = args.adminNotes;
		}

		if (args.status === "replied" && !message.repliedAt) {
			updates.repliedAt = Date.now();
		}

		await ctx.db.patch(args.id, updates);
	},
});

/**
 * Delete a message (admin only)
 */
export const remove = mutation({
	args: {
		id: v.id("contactMessages"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

/**
 * Update email sending status
 * Internal mutation called by the email action
 */
export const updateEmailStatus = mutation({
	args: {
		messageId: v.id("contactMessages"),
		emailSent: v.boolean(),
		emailError: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const updates: Record<string, unknown> = {
			emailSent: args.emailSent,
			updatedAt: Date.now(),
		};

		if (args.emailError !== undefined) {
			updates.emailError = args.emailError;
		}

		await ctx.db.patch(args.messageId, updates);
	},
});

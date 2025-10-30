import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
	args: {},
	handler: async (ctx) => {
		return ctx.db
			.query("todos")
			.withIndex("by_created_at")
			.order("desc")
			.collect()
	},
})

export const add = mutation({
	args: { text: v.string() },
	handler: async (ctx, args) => {
		return ctx.db.insert("todos", {
			text: args.text,
			completed: false,
			createdAt: Date.now(),
		})
	},
})

export const toggle = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		const todo = await ctx.db.get(args.id)
		if (!todo) {
			throw new Error("Todo not found")
		}

		return ctx.db.patch(args.id, {
			completed: !todo.completed,
		})
	},
})

export const remove = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		return ctx.db.delete(args.id)
	},
})

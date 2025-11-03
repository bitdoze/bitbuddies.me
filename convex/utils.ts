import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc, Id, TableNames } from "./_generated/dataModel"

type SluggedTables = Extract<
	TableNames,
	"courses" | "lessons" | "workshops" | "posts"
>

type Ctx = MutationCtx | QueryCtx

/**
 * Ensure a slug is unique for the given table, excluding an optional document ID.
 */
export const ensureUniqueSlug = async <TableName extends SluggedTables>(
	ctx: Ctx,
	table: TableName,
	slug: Doc<TableName>["slug"],
	excludeId?: Id<TableName>,
) => {
	const existing = await ctx.db
		.query(table)
		.withIndex("by_slug", (q) => q.eq("slug", slug))
		.first()

	if (existing && (!excludeId || existing._id !== excludeId)) {
		throw new Error(`Slug "${slug}" already exists in ${table}`)
	}
}

/**
 * Centralized admin authorization check
 * Returns the admin user if authorized, throws error otherwise
 */
export const requireAdmin = async (
	ctx: MutationCtx | QueryCtx,
	clerkId: string,
): Promise<Doc<"users">> => {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
		.first()

	if (!user) {
		throw new Error("User not found")
	}

	if (user.role !== "admin") {
		throw new Error("Admin access required")
	}

	return user
}

import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc, Id, TableNames } from "./_generated/dataModel"

type SluggedTables = Extract<
	TableNames,
	"courses" | "workshops" | "posts"
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

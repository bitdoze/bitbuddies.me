import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function usePosts(options?: {
	publishedOnly?: boolean;
	featuredOnly?: boolean;
	category?: string;
	limit?: number;
}) {
	return useQuery(api.posts.list, {
		publishedOnly: options?.publishedOnly ?? true,
		featuredOnly: options?.featuredOnly,
		category: options?.category,
		limit: options?.limit,
	});
}

export function usePost(postId?: Id<"posts">) {
	return useQuery(api.posts.getById, postId ? { postId } : "skip");
}

export function usePostBySlug(slug?: string) {
	return useQuery(api.posts.getBySlug, slug ? { slug } : "skip");
}

export function usePostsByCategory(category?: string, limit?: number) {
	return useQuery(
		api.posts.getByCategory,
		category ? { category, limit } : "skip",
	);
}

export function useCreatePost() {
	return useMutation(api.posts.create);
}

export function useUpdatePost() {
	return useMutation(api.posts.update);
}

export function useDeletePost() {
	return useMutation(api.posts.softDelete);
}

export function useIncrementPostViewCount() {
	return useMutation(api.posts.incrementViewCount);
}

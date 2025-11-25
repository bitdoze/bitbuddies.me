import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

// Link Categories
export function useLinkCategories() {
	return useQuery(api.linkCategories.list, {})
}

export function useLinkCategory(categoryId?: Id<"linkCategories">) {
	return useQuery(api.linkCategories.getById, categoryId ? { categoryId } : "skip")
}

export function useCreateLinkCategory() {
	return useMutation(api.linkCategories.create)
}

export function useUpdateLinkCategory() {
	return useMutation(api.linkCategories.update)
}

export function useDeleteLinkCategory() {
	return useMutation(api.linkCategories.remove)
}

// Affiliate Links
export function useAffiliateLinks(options?: {
	categoryId?: Id<"linkCategories">
	activeOnly?: boolean
}) {
	return useQuery(api.affiliateLinks.list, {
		categoryId: options?.categoryId,
		activeOnly: options?.activeOnly,
	})
}

export function useAffiliateLink(linkId?: Id<"affiliateLinks">) {
	return useQuery(api.affiliateLinks.getById, linkId ? { linkId } : "skip")
}

export function useAffiliateLinkBySlug(slug?: string) {
	return useQuery(api.affiliateLinks.getBySlug, slug ? { slug } : "skip")
}

export function useCreateAffiliateLink() {
	return useMutation(api.affiliateLinks.create)
}

export function useUpdateAffiliateLink() {
	return useMutation(api.affiliateLinks.update)
}

export function useDeleteAffiliateLink() {
	return useMutation(api.affiliateLinks.remove)
}

export function useTrackLinkClick() {
	return useMutation(api.affiliateLinks.trackClick)
}

// Link Stats
export function useLinkStats(
	clerkId?: string,
	options?: {
		linkId?: Id<"affiliateLinks">
		referrer?: string
		startDate?: number
		endDate?: number
	}
) {
	return useQuery(
		api.linkClicks.getStats,
		clerkId
			? {
					clerkId,
					linkId: options?.linkId,
					referrer: options?.referrer,
					startDate: options?.startDate,
					endDate: options?.endDate,
				}
			: "skip"
	)
}

export function useLinkClicksByDate(
	clerkId?: string,
	options?: {
		linkId?: Id<"affiliateLinks">
		days?: number
	}
) {
	return useQuery(
		api.linkClicks.getClicksByDate,
		clerkId
			? {
					clerkId,
					linkId: options?.linkId,
					days: options?.days,
				}
			: "skip"
	)
}

export function useLinkClicksByReferrer(
	clerkId?: string,
	options?: {
		linkId?: Id<"affiliateLinks">
		startDate?: number
		endDate?: number
	}
) {
	return useQuery(
		api.linkClicks.getClicksByReferrer,
		clerkId
			? {
					clerkId,
					linkId: options?.linkId,
					startDate: options?.startDate,
					endDate: options?.endDate,
				}
			: "skip"
	)
}

export function useLinkSummary(clerkId?: string) {
	return useQuery(api.linkClicks.getSummary, clerkId ? { clerkId } : "skip")
}

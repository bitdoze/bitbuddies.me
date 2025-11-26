import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

// Sections
export function useRecommendedSections() {
	return useQuery(api.recommendedItems.listSections, {})
}

export function useActiveRecommendedSections() {
	return useQuery(api.recommendedItems.listActiveSections, {})
}

export function useActiveRecommendedSectionsWithItems() {
	return useQuery(api.recommendedItems.listActiveSectionsWithItems, {})
}

export function useRecommendedSection(sectionId?: Id<"recommendedSections">) {
	return useQuery(
		api.recommendedItems.getSection,
		sectionId ? { sectionId } : "skip",
	)
}

export function useCreateRecommendedSection() {
	return useMutation(api.recommendedItems.createSection)
}

export function useUpdateRecommendedSection() {
	return useMutation(api.recommendedItems.updateSection)
}

export function useDeleteRecommendedSection() {
	return useMutation(api.recommendedItems.deleteSection)
}

// Items
export function useRecommendedItems(sectionId?: Id<"recommendedSections">) {
	return useQuery(api.recommendedItems.listItems, { sectionId })
}

export function useRecommendedItem(itemId?: Id<"recommendedItems">) {
	return useQuery(api.recommendedItems.getItem, itemId ? { itemId } : "skip")
}

export function useCreateRecommendedItem() {
	return useMutation(api.recommendedItems.createItem)
}

export function useUpdateRecommendedItem() {
	return useMutation(api.recommendedItems.updateItem)
}

export function useDeleteRecommendedItem() {
	return useMutation(api.recommendedItems.deleteItem)
}

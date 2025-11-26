import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Image, Package, Plus } from "lucide-react"
import { useState } from "react"
import { SEO } from "@/components/common/SEO"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import {
	useCreateRecommendedItem,
	useRecommendedSections,
} from "@/hooks/useRecommendedItems"
import type { Doc, Id } from "@/convex/_generated/dataModel"

export const Route = createFileRoute("/admin/recommended/create-item" as any)({
	component: CreateItemPage,
})

function CreateItemPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
	const createItem = useCreateRecommendedItem()
	const sections = useRecommendedSections()
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [formData, setFormData] = useState({
		sectionId: "",
		title: "",
		description: "",
		category: "",
		badge: "",
		badgeColor: "red" as "red" | "blue" | "green" | "purple",
		imageUrl: "",
		ctaText: "",
		ctaUrl: "",
		isAffiliate: true,
		order: 1,
		isActive: true,
	})

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!isAuthenticated || !user) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
							<p className="text-muted-foreground">
								You must be logged in to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isAdmin) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Admin Access Required</h1>
							<p className="text-muted-foreground">
								You need admin privileges to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.sectionId) {
			alert("Please select a section")
			return
		}

		setIsSubmitting(true)

		try {
			await createItem({
				clerkId: user.id,
				sectionId: formData.sectionId as Id<"recommendedSections">,
				title: formData.title,
				description: formData.description,
				category: formData.category,
				badge: formData.badge || undefined,
				badgeColor: formData.badge ? formData.badgeColor : undefined,
				imageUrl: formData.imageUrl,
				ctaText: formData.ctaText,
				ctaUrl: formData.ctaUrl,
				isAffiliate: formData.isAffiliate,
				order: formData.order,
				isActive: formData.isActive,
			})

			navigate({ to: "/admin/recommended" as any })
		} catch (error) {
			console.error("Failed to create item:", error)
			alert("Failed to create item. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const badgeColors = [
		{ value: "red", label: "Red", color: "bg-red-500" },
		{ value: "blue", label: "Blue", color: "bg-blue-500" },
		{ value: "green", label: "Green", color: "bg-emerald-500" },
		{ value: "purple", label: "Purple", color: "bg-purple-500" },
	]

	return (
		<>
			<SEO
				title="Add Recommended Item"
				description="Add a new recommended product or tool."
				noIndex={true}
			/>
			<div className="w-full">
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button
							variant="ghost"
							onClick={() => navigate({ to: "/admin/recommended" as any })}
							className="mb-6"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Recommended
						</Button>

						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Plus className="h-6 w-6" />
							</div>
							<h1 className="text-3xl font-bold md:text-4xl">
								Add Recommended Item
							</h1>
						</div>
						<p className="text-lg text-muted-foreground">
							Add a new product or tool to recommend
						</p>
					</div>

					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				<section className="py-12">
					<div className="container mx-auto max-w-2xl px-4">
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Basic Info */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Package className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-bold">Item Details</h2>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="sectionId">Section *</Label>
										<Select
											value={formData.sectionId}
											onValueChange={(value) =>
												setFormData({ ...formData, sectionId: value })
											}
										>
											<SelectTrigger id="sectionId">
												<SelectValue placeholder="Select a section" />
											</SelectTrigger>
											<SelectContent>
												{sections?.map((section: Doc<"recommendedSections">) => (
													<SelectItem key={section._id} value={section._id}>
														{section.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="title">Title *</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="Windsurf IDE: Code Smarter..."
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description *</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({ ...formData, description: e.target.value })
											}
											placeholder="Supercharge your development workflow..."
											rows={3}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="category">Category Tag *</Label>
										<Input
											id="category"
											value={formData.category}
											onChange={(e) =>
												setFormData({ ...formData, category: e.target.value })
											}
											placeholder="AI CLI + IDE"
											required
										/>
										<p className="text-sm text-muted-foreground">
											Displayed as a tag on the card
										</p>
									</div>
								</div>
							</div>

							{/* Image & Badge */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Image className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-bold">Image & Badge</h2>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="imageUrl">Image URL *</Label>
										<Input
											id="imageUrl"
											type="url"
											value={formData.imageUrl}
											onChange={(e) =>
												setFormData({ ...formData, imageUrl: e.target.value })
											}
											placeholder="https://example.com/logo.png"
											required
										/>
										<p className="text-sm text-muted-foreground">
											External URL to the product logo/image
										</p>
									</div>

									{formData.imageUrl && (
										<div className="rounded-lg border border-border bg-muted/50 p-4">
											<p className="text-sm text-muted-foreground mb-2">
												Preview:
											</p>
											<img
												src={formData.imageUrl}
												alt="Preview"
												className="h-20 w-20 object-contain rounded"
											/>
										</div>
									)}

									<div className="space-y-2">
										<Label htmlFor="badge">Badge Text</Label>
										<Input
											id="badge"
											value={formData.badge}
											onChange={(e) =>
												setFormData({ ...formData, badge: e.target.value })
											}
											placeholder="25 FREE CREDITS"
										/>
										<p className="text-sm text-muted-foreground">
											Optional badge shown in top-right corner
										</p>
									</div>

									{formData.badge && (
										<div className="space-y-2">
											<Label>Badge Color</Label>
											<div className="flex gap-2">
												{badgeColors.map((color) => (
													<button
														key={color.value}
														type="button"
														onClick={() =>
															setFormData({
																...formData,
																badgeColor: color.value as typeof formData.badgeColor,
															})
														}
														className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
															formData.badgeColor === color.value
																? "border-primary ring-2 ring-primary/20"
																: "border-border"
														}`}
													>
														<span
															className={`h-4 w-4 rounded ${color.color}`}
														/>
														{color.label}
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* CTA */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<ArrowLeft className="h-5 w-5 rotate-180" />
									</div>
									<h2 className="text-2xl font-bold">Call to Action</h2>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="ctaText">Button Text *</Label>
										<Input
											id="ctaText"
											value={formData.ctaText}
											onChange={(e) =>
												setFormData({ ...formData, ctaText: e.target.value })
											}
											placeholder="Get 25 Monthly Credits"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="ctaUrl">Destination URL *</Label>
										<Input
											id="ctaUrl"
											type="url"
											value={formData.ctaUrl}
											onChange={(e) =>
												setFormData({ ...formData, ctaUrl: e.target.value })
											}
											placeholder="https://example.com/affiliate?ref=123"
											required
										/>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											id="isAffiliate"
											checked={formData.isAffiliate}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isAffiliate: checked })
											}
										/>
										<Label htmlFor="isAffiliate">
											Show "Affiliate link" label
										</Label>
									</div>
								</div>
							</div>

							{/* Settings */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="order">Display Order</Label>
										<Input
											id="order"
											type="number"
											value={formData.order}
											onChange={(e) =>
												setFormData({
													...formData,
													order: Number.parseInt(e.target.value) || 1,
												})
											}
											min={1}
										/>
										<p className="text-sm text-muted-foreground">
											Lower numbers appear first within the section
										</p>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											id="isActive"
											checked={formData.isActive}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isActive: checked })
											}
										/>
										<Label htmlFor="isActive">Active</Label>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex justify-end gap-4">
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={() => navigate({ to: "/admin/recommended" as any })}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="shadow-md"
									>
										{isSubmitting ? "Creating..." : "Add Item"}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</section>
			</div>
		</>
	)
}

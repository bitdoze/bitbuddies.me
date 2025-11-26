import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Layers } from "lucide-react"
import { useEffect, useState } from "react"
import { SEO } from "@/components/common/SEO"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"
import {
	useRecommendedSection,
	useUpdateRecommendedSection,
} from "@/hooks/useRecommendedItems"
import type { Id } from "@/convex/_generated/dataModel"

export const Route = createFileRoute("/admin/recommended/$sectionId/edit" as any)({
	component: EditSectionPage,
})

function EditSectionPage() {
	const params = Route.useParams()
	const sectionId = params.sectionId
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
	const section = useRecommendedSection(sectionId as Id<"recommendedSections">)
	const updateSection = useUpdateRecommendedSection()
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		order: 1,
		isActive: true,
	})

	useEffect(() => {
		if (section) {
			setFormData({
				title: section.title,
				slug: section.slug,
				order: section.order,
				isActive: section.isActive,
			})
		}
	}, [section])

	if (isLoading || section === undefined) {
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

	if (section === null) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Section Not Found</h1>
							<p className="text-muted-foreground">
								The section you're looking for doesn't exist.
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			await updateSection({
				clerkId: user.id,
				sectionId: sectionId as Id<"recommendedSections">,
				title: formData.title,
				slug: formData.slug,
				order: formData.order,
				isActive: formData.isActive,
			})

			navigate({ to: "/admin/recommended" as any })
		} catch (error) {
			console.error("Failed to update section:", error)
			alert("Failed to update section. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<SEO
				title="Edit Section"
				description="Edit a recommended items section."
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
								<Layers className="h-6 w-6" />
							</div>
							<h1 className="text-3xl font-bold md:text-4xl">Edit Section</h1>
						</div>
						<p className="text-lg text-muted-foreground">
							Update section details
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
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Layers className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-bold">Section Details</h2>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="title">Title *</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="AI CLI + IDE"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="slug">Slug *</Label>
										<Input
											id="slug"
											value={formData.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
											placeholder="ai-cli-ide"
											required
										/>
									</div>

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
										{isSubmitting ? "Saving..." : "Save Changes"}
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

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Edit, Link2 } from "lucide-react"
import { useEffect, useState } from "react"
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
	useAffiliateLink,
	useUpdateAffiliateLink,
	useLinkCategories,
} from "@/hooks/useAffiliateLinks"
import type { Doc, Id } from "@/convex/_generated/dataModel"

export const Route = createFileRoute("/admin/links/$id/edit")({
	component: EditLinkPage,
})

function EditLinkPage() {
	const { id } = Route.useParams()
	const { isAuthenticated, isLoading: authLoading, isAdmin, user } = useAuth()
	const link = useAffiliateLink(id as Id<"affiliateLinks">)
	const updateLink = useUpdateAffiliateLink()
	const categories = useLinkCategories()
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		destinationUrl: "",
		description: "",
		categoryId: "",
		isActive: true,
	})

	useEffect(() => {
		if (link) {
			setFormData({
				name: link.name,
				slug: link.slug,
				destinationUrl: link.destinationUrl,
				description: link.description ?? "",
				categoryId: link.categoryId ?? "",
				isActive: link.isActive,
			})
		}
	}, [link])

	if (authLoading || link === undefined) {
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

	if (link === null) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Link Not Found</h1>
							<p className="text-muted-foreground">
								The requested link could not be found.
							</p>
							<Button
								className="mt-4"
								onClick={() => navigate({ to: "/admin/links" })}
							>
								Back to Links
							</Button>
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
			await updateLink({
				clerkId: user.id,
				linkId: id as Id<"affiliateLinks">,
				name: formData.name,
				slug: formData.slug,
				destinationUrl: formData.destinationUrl,
				description: formData.description || undefined,
				categoryId: formData.categoryId ? (formData.categoryId as Id<"linkCategories">) : undefined,
				isActive: formData.isActive,
			})

			navigate({ to: "/admin/links" })
		} catch (error) {
			console.error("Failed to update link:", error)
			alert("Failed to update link. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<SEO
				title={`Edit: ${link.name}`}
				description="Edit affiliate link settings."
				noIndex={true}
			/>
			<div className="w-full">
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button
							variant="ghost"
							onClick={() => navigate({ to: "/admin/links" })}
							className="mb-6"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Links
						</Button>

						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Edit className="h-6 w-6" />
							</div>
							<h1 className="text-3xl font-bold md:text-4xl">Edit Link</h1>
						</div>
						<p className="text-lg text-muted-foreground">
							Update affiliate link settings
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
										<Link2 className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-bold">Link Details</h2>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Name *</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="My Affiliate Link"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="slug">Short URL Slug *</Label>
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												/go/
											</span>
											<Input
												id="slug"
												value={formData.slug}
												onChange={(e) =>
													setFormData({ ...formData, slug: e.target.value })
												}
												placeholder="my-link"
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="destinationUrl">Destination URL *</Label>
										<Input
											id="destinationUrl"
											type="url"
											value={formData.destinationUrl}
											onChange={(e) =>
												setFormData({
													...formData,
													destinationUrl: e.target.value,
												})
											}
											placeholder="https://example.com/affiliate?ref=123"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder="Optional notes about this link"
											rows={3}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Select
											value={formData.categoryId}
											onValueChange={(value) =>
												setFormData({ ...formData, categoryId: value })
											}
										>
											<SelectTrigger id="category">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{categories?.map((category: Doc<"linkCategories">) => (
													<SelectItem key={category._id} value={category._id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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

									<div className="rounded-lg bg-muted p-4">
										<p className="text-sm text-muted-foreground">
											<strong>Total Clicks:</strong> {link.clickCount}
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex justify-end gap-4">
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={() => navigate({ to: "/admin/links" })}
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

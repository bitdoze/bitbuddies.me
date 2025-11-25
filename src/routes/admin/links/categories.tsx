import { createFileRoute, Link } from "@tanstack/react-router"
import {
	AlertCircle,
	ArrowLeft,
	Edit,
	FolderOpen,
	Plus,
	Trash2,
} from "lucide-react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminShell } from "@/components/admin/AdminShell"
import { AdminTable } from "@/components/admin/AdminTable"
import { SEO } from "@/components/common/SEO"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import {
	useLinkCategories,
	useCreateLinkCategory,
	useUpdateLinkCategory,
	useDeleteLinkCategory,
} from "@/hooks/useAffiliateLinks"
import type { Doc, Id } from "@/convex/_generated/dataModel"

export const Route = createFileRoute("/admin/links/categories")({
	component: CategoriesPage,
})

function CategoriesPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
	const categories = useLinkCategories()
	const createCategory = useCreateLinkCategory()
	const updateCategory = useUpdateLinkCategory()
	const deleteCategory = useDeleteLinkCategory()

	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
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

	if (!isAuthenticated) {
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

	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "")
	}

	const handleNameChange = (name: string) => {
		setFormData({
			...formData,
			name,
			slug: generateSlug(name),
		})
	}

	const resetForm = () => {
		setFormData({ name: "", slug: "", description: "" })
	}

	const handleCreate = async () => {
		if (!user) return
		setIsSubmitting(true)

		try {
			await createCategory({
				clerkId: user.id,
				name: formData.name,
				slug: formData.slug,
				description: formData.description || undefined,
			})
			setCreateDialogOpen(false)
			resetForm()
		} catch (error) {
			console.error("Failed to create category:", error)
			alert("Failed to create category. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const openEditDialog = (category: NonNullable<typeof categories>[number]) => {
		setSelectedCategoryId(category._id)
		setFormData({
			name: category.name,
			slug: category.slug,
			description: category.description ?? "",
		})
		setEditDialogOpen(true)
	}

	const handleUpdate = async () => {
		if (!user || !selectedCategoryId) return
		setIsSubmitting(true)

		try {
			await updateCategory({
				clerkId: user.id,
				categoryId: selectedCategoryId as Id<"linkCategories">,
				name: formData.name,
				slug: formData.slug,
				description: formData.description || undefined,
			})
			setEditDialogOpen(false)
			setSelectedCategoryId(null)
			resetForm()
		} catch (error) {
			console.error("Failed to update category:", error)
			alert("Failed to update category. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDelete = async () => {
		if (!user || !selectedCategoryId) return
		setIsSubmitting(true)

		try {
			await deleteCategory({
				clerkId: user.id,
				categoryId: selectedCategoryId as Id<"linkCategories">,
			})
			setDeleteDialogOpen(false)
			setSelectedCategoryId(null)
		} catch (error) {
			console.error("Failed to delete category:", error)
			alert("Failed to delete category. It may have links assigned to it.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<SEO
				title="Link Categories"
				description="Manage categories for organizing affiliate links."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Link management"
						title="Link Categories"
						description="Organize your affiliate links into categories."
						actions={
							<div className="flex flex-wrap items-center gap-2">
								<Button asChild variant="outline" size="sm">
									<Link to="/admin/links">
										<ArrowLeft className="mr-2 h-4 w-4" />
										Back to Links
									</Link>
								</Button>
								<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
									<DialogTrigger asChild>
										<Button size="sm" className="gap-2" onClick={resetForm}>
											<Plus className="h-4 w-4" />
											New Category
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create Category</DialogTitle>
											<DialogDescription>
												Add a new category to organize your affiliate links.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="create-name">Name *</Label>
												<Input
													id="create-name"
													value={formData.name}
													onChange={(e) => handleNameChange(e.target.value)}
													placeholder="Category name"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="create-slug">Slug *</Label>
												<Input
													id="create-slug"
													value={formData.slug}
													onChange={(e) =>
														setFormData({ ...formData, slug: e.target.value })
													}
													placeholder="category-slug"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="create-description">Description</Label>
												<Textarea
													id="create-description"
													value={formData.description}
													onChange={(e) =>
														setFormData({ ...formData, description: e.target.value })
													}
													placeholder="Optional description"
													rows={2}
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() => setCreateDialogOpen(false)}
												disabled={isSubmitting}
											>
												Cancel
											</Button>
											<Button onClick={handleCreate} disabled={isSubmitting}>
												{isSubmitting ? "Creating..." : "Create"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						}
						stats={[{ label: "Total Categories", value: categories?.length ?? 0 }]}
					/>

					<AdminTable
						title="All categories"
						description="Manage categories for organizing affiliate links."
						badge={<Badge variant="secondary">{categories?.length ?? 0}</Badge>}
					>
						{!categories || categories.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<FolderOpen className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No categories yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Create categories to organize your affiliate links.
									</p>
								</div>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Slug</TableHead>
											<TableHead>Description</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{categories.map((category: Doc<"linkCategories">) => (
											<TableRow key={category._id}>
												<TableCell>
													<span className="font-medium">{category.name}</span>
												</TableCell>
												<TableCell>
													<code className="rounded bg-muted px-2 py-1 text-sm">
														{category.slug}
													</code>
												</TableCell>
												<TableCell>
													<span className="text-muted-foreground">
														{category.description || "—"}
													</span>
												</TableCell>
												<TableCell>
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => openEditDialog(category)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Dialog
															open={deleteDialogOpen && selectedCategoryId === category._id}
															onOpenChange={(open) => {
																setDeleteDialogOpen(open)
																if (!open) setSelectedCategoryId(null)
															}}
														>
															<DialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setSelectedCategoryId(category._id)}
																>
																	<Trash2 className="h-4 w-4 text-destructive" />
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Delete category</DialogTitle>
																	<DialogDescription>
																		Are you sure you want to delete "{category.name}"?
																		Categories with links cannot be deleted.
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<Button
																		variant="outline"
																		onClick={() => {
																			setDeleteDialogOpen(false)
																			setSelectedCategoryId(null)
																		}}
																	>
																		Cancel
																	</Button>
																	<Button
																		variant="destructive"
																		onClick={handleDelete}
																		disabled={isSubmitting}
																	>
																		{isSubmitting ? "Deleting..." : "Delete"}
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</AdminTable>

					{/* Edit Dialog */}
					<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Category</DialogTitle>
								<DialogDescription>
									Update category details.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="edit-name">Name *</Label>
									<Input
										id="edit-name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Category name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-slug">Slug *</Label>
									<Input
										id="edit-slug"
										value={formData.slug}
										onChange={(e) =>
											setFormData({ ...formData, slug: e.target.value })
										}
										placeholder="category-slug"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-description">Description</Label>
									<Textarea
										id="edit-description"
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="Optional description"
										rows={2}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setEditDialogOpen(false)
										setSelectedCategoryId(null)
										resetForm()
									}}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button onClick={handleUpdate} disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</AdminShell>
			</div>
		</>
	)
}

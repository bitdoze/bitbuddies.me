import { createFileRoute, Link } from "@tanstack/react-router"
import {
	AlertCircle,
	Edit,
	ExternalLink,
	FolderPlus,
	Layers,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import {
	useRecommendedSections,
	useRecommendedItems,
	useDeleteRecommendedSection,
	useDeleteRecommendedItem,
} from "@/hooks/useRecommendedItems"
import type { Doc, Id } from "@/convex/_generated/dataModel"

export const Route = createFileRoute("/admin/recommended/" as any)({
	component: AdminRecommendedPage,
})

function AdminRecommendedPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
	const sections = useRecommendedSections()
	const items = useRecommendedItems()
	const deleteSection = useDeleteRecommendedSection()
	const deleteItem = useDeleteRecommendedItem()

	const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false)
	const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false)
	const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
	const [sectionFilter, setSectionFilter] = useState<string>("all")

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

	const handleDeleteSection = async () => {
		if (!selectedSectionId || !user) return
		try {
			await deleteSection({
				clerkId: user.id,
				sectionId: selectedSectionId as Id<"recommendedSections">,
			})
			setDeleteSectionDialogOpen(false)
			setSelectedSectionId(null)
		} catch (error) {
			console.error("Failed to delete section:", error)
		}
	}

	const handleDeleteItem = async () => {
		if (!selectedItemId || !user) return
		try {
			await deleteItem({
				clerkId: user.id,
				itemId: selectedItemId as Id<"recommendedItems">,
			})
			setDeleteItemDialogOpen(false)
			setSelectedItemId(null)
		} catch (error) {
			console.error("Failed to delete item:", error)
		}
	}

	const filteredItems = items?.filter((item: any) => {
		if (sectionFilter === "all") return true
		return item.sectionId === sectionFilter
	})

	const badgeColorMap: Record<string, string> = {
		red: "bg-red-500 text-white",
		blue: "bg-blue-500 text-white",
		green: "bg-emerald-500 text-white",
		purple: "bg-purple-500 text-white",
	}

	return (
		<>
			<SEO
				title="Manage Recommended Items"
				description="Admin dashboard for managing recommended products and tools."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Recommendations"
						title="Recommended Items"
						description="Manage recommended products and tools displayed on the site."
						actions={
							<div className="flex flex-wrap items-center gap-2">
								<Button asChild variant="outline" size="sm">
									<Link to={"/admin/recommended/create-section" as any}>
										<FolderPlus className="mr-2 h-4 w-4" />
										New Section
									</Link>
								</Button>
								<Button asChild size="sm" className="gap-2">
									<Link to={"/admin/recommended/create-item" as any}>
										<Plus className="h-4 w-4" />
										New Item
									</Link>
								</Button>
							</div>
						}
						stats={[
							{ label: "Sections", value: sections?.length ?? 0 },
							{ label: "Items", value: items?.length ?? 0 },
						]}
					/>

					{/* Sections Table */}
					<AdminTable
						title="Sections"
						description="Organize recommended items into sections."
						badge={<Badge variant="secondary">{sections?.length ?? 0}</Badge>}
					>
						{!sections || sections.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<Layers className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No sections yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Create your first section to organize recommendations.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to={"/admin/recommended/create-section" as any}>
										<FolderPlus className="h-4 w-4" />
										Create section
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Slug</TableHead>
											<TableHead>Order</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sections
											.sort((a: any, b: any) => a.order - b.order)
											.map((section: Doc<"recommendedSections">) => (
												<TableRow key={section._id}>
													<TableCell className="font-medium">
														{section.title}
													</TableCell>
													<TableCell>
														<code className="rounded bg-muted px-2 py-1 text-sm">
															{section.slug}
														</code>
													</TableCell>
													<TableCell>{section.order}</TableCell>
													<TableCell>
														<Badge
															variant={section.isActive ? "default" : "secondary"}
														>
															{section.isActive ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex justify-end gap-2">
															<Button variant="ghost" size="icon" asChild>
																<Link
																	to={"/admin/recommended/$sectionId/edit" as any}
																	params={{ sectionId: section._id } as any}
																>
																	<Edit className="h-4 w-4" />
																</Link>
															</Button>
															<Dialog
																open={
																	deleteSectionDialogOpen &&
																	selectedSectionId === section._id
																}
																onOpenChange={(open) => {
																	setDeleteSectionDialogOpen(open)
																	if (!open) setSelectedSectionId(null)
																}}
															>
																<DialogTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() =>
																			setSelectedSectionId(section._id)
																		}
																	>
																		<Trash2 className="h-4 w-4 text-destructive" />
																	</Button>
																</DialogTrigger>
																<DialogContent>
																	<DialogHeader>
																		<DialogTitle>Delete section</DialogTitle>
																		<DialogDescription>
																			Are you sure you want to delete "
																			{section.title}"? This will also delete all
																			items in this section.
																		</DialogDescription>
																	</DialogHeader>
																	<DialogFooter>
																		<Button
																			variant="outline"
																			onClick={() => {
																				setDeleteSectionDialogOpen(false)
																				setSelectedSectionId(null)
																			}}
																		>
																			Cancel
																		</Button>
																		<Button
																			variant="destructive"
																			onClick={handleDeleteSection}
																		>
																			Delete
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

					{/* Items Table */}
					<AdminTable
						title="Items"
						description="Individual recommended products and tools."
						badge={<Badge variant="secondary">{filteredItems?.length ?? 0}</Badge>}
						actions={
							<Select value={sectionFilter} onValueChange={setSectionFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by section" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Sections</SelectItem>
									{sections?.map((section: Doc<"recommendedSections">) => (
										<SelectItem key={section._id} value={section._id}>
											{section.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						}
					>
						{!filteredItems || filteredItems.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<Layers className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No items yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Add recommended items to display on the site.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to={"/admin/recommended/create-item" as any}>
										<Plus className="h-4 w-4" />
										Add item
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Image</TableHead>
											<TableHead>Title</TableHead>
											<TableHead>Section</TableHead>
											<TableHead>Badge</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredItems
											.sort((a: any, b: any) => a.order - b.order)
											.map((item: any) => (
												<TableRow key={item._id}>
													<TableCell>
														<img
															src={item.imageUrl}
															alt={item.title}
															className="h-10 w-10 rounded object-contain bg-muted"
														/>
													</TableCell>
													<TableCell>
														<div className="space-y-1">
															<p className="font-medium">{item.title}</p>
															<p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
																{item.description}
															</p>
														</div>
													</TableCell>
													<TableCell>
														{item.section ? (
															<Badge variant="outline">{item.section.title}</Badge>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
													<TableCell>
														{item.badge ? (
															<span
																className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${badgeColorMap[item.badgeColor ?? "red"]}`}
															>
																{item.badge}
															</span>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant={item.isActive ? "default" : "secondary"}
														>
															{item.isActive ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex justify-end gap-2">
															<Button
																variant="ghost"
																size="icon"
																asChild
																title="Open destination"
															>
																<a
																	href={item.ctaUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	<ExternalLink className="h-4 w-4" />
																</a>
															</Button>
															<Button variant="ghost" size="icon" asChild>
																<Link
																	to={"/admin/recommended/items/$itemId/edit" as any}
																	params={{ itemId: item._id } as any}
																>
																	<Edit className="h-4 w-4" />
																</Link>
															</Button>
															<Dialog
																open={
																	deleteItemDialogOpen &&
																	selectedItemId === item._id
																}
																onOpenChange={(open) => {
																	setDeleteItemDialogOpen(open)
																	if (!open) setSelectedItemId(null)
																}}
															>
																<DialogTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => setSelectedItemId(item._id)}
																	>
																		<Trash2 className="h-4 w-4 text-destructive" />
																	</Button>
																</DialogTrigger>
																<DialogContent>
																	<DialogHeader>
																		<DialogTitle>Delete item</DialogTitle>
																		<DialogDescription>
																			Are you sure you want to delete "
																			{item.title}"?
																		</DialogDescription>
																	</DialogHeader>
																	<DialogFooter>
																		<Button
																			variant="outline"
																			onClick={() => {
																				setDeleteItemDialogOpen(false)
																				setSelectedItemId(null)
																			}}
																		>
																			Cancel
																		</Button>
																		<Button
																			variant="destructive"
																			onClick={handleDeleteItem}
																		>
																			Delete
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
				</AdminShell>
			</div>
		</>
	)
}

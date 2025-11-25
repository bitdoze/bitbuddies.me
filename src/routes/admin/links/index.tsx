import { createFileRoute, Link } from "@tanstack/react-router"
import { ConvexHttpClient } from "convex/browser"
import {
	AlertCircle,
	Copy,
	Edit,
	ExternalLink,
	FolderOpen,
	Link2,
	Plus,
	Trash2,
	BarChart3,
} from "lucide-react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminShell } from "@/components/admin/AdminShell"
import { AdminStatCard } from "@/components/admin/AdminStatCard"
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
	useAffiliateLinks,
	useDeleteAffiliateLink,
	useLinkCategories,
	useLinkSummary,
} from "@/hooks/useAffiliateLinks"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"

type LinkWithCategory = Doc<"affiliateLinks"> & {
	category: Doc<"linkCategories"> | null
}

export const Route = createFileRoute("/admin/links/")({
	component: AdminLinksPage,
	loader: async () => {
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL
			if (!convexUrl) {
				return { links: null }
			}

			const client = new ConvexHttpClient(convexUrl)
			const links = await client.query(api.affiliateLinks.list, {})
			return { links }
		} catch (error) {
			console.error("Failed to prefetch links:", error)
			return { links: null }
		}
	},
})

function AdminLinksPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
	const loaderData = Route.useLoaderData()
	const clientLinks = useAffiliateLinks()
	const links = loaderData?.links ?? clientLinks
	const categories = useLinkCategories()
	const summary = useLinkSummary(user?.id)
	const deleteLink = useDeleteAffiliateLink()

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
	const [categoryFilter, setCategoryFilter] = useState<string>("all")

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading links...</p>
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

	const handleDelete = async () => {
		if (!selectedLinkId || !user) return

		try {
			await deleteLink({
				clerkId: user.id,
				linkId: selectedLinkId as Id<"affiliateLinks">,
			})
			setDeleteDialogOpen(false)
			setSelectedLinkId(null)
		} catch (error) {
			console.error("Failed to delete link:", error)
		}
	}

	const copyToClipboard = (slug: string) => {
		const url = `${window.location.origin}/go/${slug}`
		navigator.clipboard.writeText(url)
	}

	const filteredLinks = links?.filter((link: LinkWithCategory) => {
		if (categoryFilter === "all") return true
		if (categoryFilter === "uncategorized") return !link.categoryId
		return link.categoryId === categoryFilter
	})

	const totalLinks = summary?.totalLinks ?? 0
	const activeLinks = summary?.activeLinks ?? 0
	const totalClicks = summary?.totalClicks ?? 0
	const clicksLast24h = summary?.clicksLast24h ?? 0

	return (
		<>
			<SEO
				title="Manage Affiliate Links"
				description="Admin dashboard for managing affiliate links and tracking clicks."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Link management"
						title="Affiliate Links"
						description="Create and manage shortened affiliate links with click tracking."
						actions={
							<div className="flex flex-wrap items-center gap-2">
								<Button asChild variant="outline" size="sm">
									<Link to="/admin/links/stats">
										<BarChart3 className="mr-2 h-4 w-4" />
										View Stats
									</Link>
								</Button>
								<Button asChild variant="outline" size="sm">
									<Link to="/admin/links/categories">
										<FolderOpen className="mr-2 h-4 w-4" />
										Categories
									</Link>
								</Button>
								<Button asChild size="sm" className="gap-2">
									<Link to="/admin/links/create">
										<Plus className="h-4 w-4" />
										New Link
									</Link>
								</Button>
							</div>
						}
						stats={[
							{ label: "Total Links", value: totalLinks },
							{ label: "Active Links", value: activeLinks },
							{ label: "Total Clicks", value: totalClicks },
							{ label: "Last 24h", value: clicksLast24h },
						]}
					/>

					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<AdminStatCard
							label="Total links"
							value={totalLinks}
							description="All created links"
							icon={<Link2 className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Active links"
							value={activeLinks}
							description="Currently active"
							icon={<ExternalLink className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Total clicks"
							value={totalClicks}
							description="All time"
							icon={<BarChart3 className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Clicks (24h)"
							value={clicksLast24h}
							description="Last 24 hours"
							icon={<BarChart3 className="h-4 w-4" />}
						/>
					</div>

					<AdminTable
						title="All links"
						description="Manage your affiliate links from a single place."
						badge={<Badge variant="secondary">{filteredLinks?.length ?? 0}</Badge>}
						actions={
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									<SelectItem value="uncategorized">Uncategorized</SelectItem>
									{categories?.map((category: Doc<"linkCategories">) => (
										<SelectItem key={category._id} value={category._id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						}
					>
						{!filteredLinks || filteredLinks.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<Link2 className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No links yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Create your first affiliate link to start tracking.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to="/admin/links/create">
										<Plus className="h-4 w-4" />
										Create link
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Short URL</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Clicks</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredLinks.map((link: LinkWithCategory) => (
											<TableRow key={link._id}>
												<TableCell>
													<div className="space-y-1">
														<p className="font-medium text-foreground">
															{link.name}
														</p>
														<p className="line-clamp-1 text-xs text-muted-foreground max-w-[200px]">
															{link.destinationUrl}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<code className="rounded bg-muted px-2 py-1 text-sm">
														/go/{link.slug}
													</code>
												</TableCell>
												<TableCell>
													{link.category ? (
														<Badge variant="outline">{link.category.name}</Badge>
													) : (
														<span className="text-muted-foreground">—</span>
													)}
												</TableCell>
												<TableCell>
													<Badge variant={link.isActive ? "default" : "secondary"}>
														{link.isActive ? "Active" : "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													<span className="font-medium">{link.clickCount}</span>
												</TableCell>
												<TableCell>
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => copyToClipboard(link.slug)}
															title="Copy short URL"
														>
															<Copy className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															asChild
															title="Open destination"
														>
															<a
																href={link.destinationUrl}
																target="_blank"
																rel="noopener noreferrer"
															>
																<ExternalLink className="h-4 w-4" />
															</a>
														</Button>
														<Button variant="ghost" size="icon" asChild>
															<Link
																to="/admin/links/$id/edit"
																params={{ id: link._id }}
															>
																<Edit className="h-4 w-4" />
															</Link>
														</Button>
														<Dialog
															open={deleteDialogOpen && selectedLinkId === link._id}
															onOpenChange={(open) => {
																setDeleteDialogOpen(open)
																if (!open) setSelectedLinkId(null)
															}}
														>
															<DialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setSelectedLinkId(link._id)}
																>
																	<Trash2 className="h-4 w-4 text-destructive" />
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Delete link</DialogTitle>
																	<DialogDescription>
																		Are you sure you want to delete "{link.name}"?
																		This will also delete all click statistics.
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<Button
																		variant="outline"
																		onClick={() => {
																			setDeleteDialogOpen(false)
																			setSelectedLinkId(null)
																		}}
																	>
																		Cancel
																	</Button>
																	<Button variant="destructive" onClick={handleDelete}>
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

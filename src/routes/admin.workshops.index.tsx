import { createFileRoute } from "@tanstack/react-router";
import { Edit, Eye, ImageIcon, Plus, Trash2, LayoutGrid, AlertCircle } from "lucide-react";
import { useState } from "react";
import { SEO } from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useAuth } from "../hooks/useAuth";
import { useDeleteWorkshop, useWorkshops } from "../hooks/useWorkshops";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/admin/workshops/")({
	component: AdminWorkshopsPage,
	loader: async () => {
		// Prefetch all workshops (including unpublished) on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
				return { workshops: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const workshops = await client.query(api.workshops.list, {
				publishedOnly: false,
			});
			return { workshops };
		} catch (error) {
			console.error("Failed to prefetch workshops:", error);
			return { workshops: null };
		}
	},
});

function AdminWorkshopsPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientWorkshops = useWorkshops({ publishedOnly: false });

	// Prefer loader data, fallback to client fetch
	const workshops = loaderData?.workshops ?? clientWorkshops;
	const deleteWorkshop = useDeleteWorkshop();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
		null,
	);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading workshops...</p>
					</div>
				</div>
			</div>
		);
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
		);
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
		);
	}

	const handleDelete = async () => {
		if (!selectedWorkshopId || !user) return;

		try {
			await deleteWorkshop({
				clerkId: user.id,
				workshopId: selectedWorkshopId as any,
			});
			setDeleteDialogOpen(false);
			setSelectedWorkshopId(null);
		} catch (error) {
			console.error("Failed to delete workshop:", error);
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp).toLocaleDateString();
	};

	return (
		<>
			<SEO
				title="Manage Workshops"
				description="Admin dashboard for managing workshops, creating new content, and editing existing workshops."
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
							<div>
								<div className="mb-4 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<LayoutGrid className="h-6 w-6" />
									</div>
									<h1 className="text-3xl md:text-4xl font-bold">Manage Workshops</h1>
								</div>
								<p className="text-lg text-muted-foreground">
									Create and manage workshop content
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{workshops?.length ?? 0} workshop(s) total
								</p>
							</div>
							<Button asChild size="lg" className="shadow-md">
								<a href="/admin/workshops/create">
									<Plus className="mr-2 h-5 w-5" />
									New Workshop
								</a>
							</Button>
						</div>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Workshops Table Section */}
				<section className="py-12">
					<div className="container mx-auto px-4">
						<div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
							{!workshops || workshops.length === 0 ? (
								<div className="p-12 text-center">
									<div className="mb-4 inline-flex rounded-full bg-muted p-4">
										<LayoutGrid className="h-12 w-12 text-muted-foreground" />
									</div>
									<h3 className="text-xl font-semibold mb-2">No Workshops Yet</h3>
									<p className="text-muted-foreground mb-6">
										Create your first workshop to get started.
									</p>
									<Button asChild size="lg">
										<a href="/admin/workshops/create">
											<Plus className="mr-2 h-5 w-5" />
											Create Workshop
										</a>
									</Button>
								</div>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50">
												<TableHead>Image</TableHead>
												<TableHead>Title</TableHead>
												<TableHead>Level</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Start Date</TableHead>
												<TableHead>Participants</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{workshops.map((workshop) => (
												<WorkshopRow
													key={workshop._id}
													workshop={workshop}
													handleDelete={handleDelete}
													setSelectedWorkshopId={setSelectedWorkshopId}
													setDeleteDialogOpen={setDeleteDialogOpen}
													deleteDialogOpen={deleteDialogOpen}
													selectedWorkshopId={selectedWorkshopId}
													formatDate={formatDate}
												/>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

function WorkshopRow({
	workshop,
	handleDelete,
	setSelectedWorkshopId,
	setDeleteDialogOpen,
	deleteDialogOpen,
	selectedWorkshopId,
	formatDate,
}: any) {
	return (
		<TableRow>
			<TableCell>
				{workshop.coverAsset?.url ? (
					<img
						src={workshop.coverAsset.url}
						alt={workshop.title}
						className="w-16 h-16 object-cover rounded-lg shadow-sm"
					/>
				) : (
					<div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
						<ImageIcon className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell className="font-medium">
				{workshop.title}
				{workshop.isFeatured && (
					<Badge variant="secondary" className="ml-2">
						Featured
					</Badge>
				)}
			</TableCell>
			<TableCell>
				<Badge variant="outline">{workshop.level}</Badge>
			</TableCell>
			<TableCell>
				{workshop.isPublished ? (
					<Badge variant="default">Published</Badge>
				) : (
					<Badge variant="secondary">Draft</Badge>
				)}
				{workshop.isLive && (
					<Badge variant="destructive" className="ml-2">
						Live
					</Badge>
				)}
			</TableCell>
			<TableCell>{formatDate(workshop.startDate)}</TableCell>
			<TableCell>
				{workshop.currentParticipants}
				{workshop.maxParticipants && " / ${workshop.maxParticipants}"}
			</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-2">
					<Button variant="ghost" size="icon" asChild className="hover:bg-muted">
						<a href={`/workshops/${workshop.slug}`} title="View Workshop">
							<Eye className="h-4 w-4" />
						</a>
					</Button>
					<Button variant="ghost" size="icon" asChild className="hover:bg-muted">
						<a href={`/admin/workshops/${workshop._id}/edit`} title="Edit Workshop">
							<Edit className="h-4 w-4" />
						</a>
					</Button>
					<Dialog
						open={deleteDialogOpen && selectedWorkshopId === workshop._id}
						onOpenChange={(open) => {
							setDeleteDialogOpen(open);
							if (!open) setSelectedWorkshopId(null);
						}}
					>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setSelectedWorkshopId(workshop._id)}
								className="hover:bg-destructive/10"
								title="Delete Workshop"
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Delete Workshop</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete "{workshop.title}"? This action cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setDeleteDialogOpen(false);
										setSelectedWorkshopId(null);
									}}
								>
									Cancel
								</Button>
								<Button variant="destructive" onClick={handleDelete}>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</TableCell>
		</TableRow>
	);
}

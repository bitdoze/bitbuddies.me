import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Edit, Eye, Plus, Trash2, ImageIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
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
import { useMediaAsset } from "../hooks/useMediaAssets";
import { SEO } from "../components/common/SEO";

export const Route = createFileRoute("/admin/workshops/")({
	component: AdminWorkshopsPage,
});

function AdminWorkshopsPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
	const workshops = useWorkshops({ publishedOnly: false });
	const deleteWorkshop = useDeleteWorkshop();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
		null,
	)

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>
							You must be logged in to access this page.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	if (!isAdmin) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Admin Access Required</CardTitle>
						<CardDescription>
							You need admin privileges to access this page.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	const handleDelete = async () => {
		if (!selectedWorkshopId || !user) return;

		try {
			await deleteWorkshop({
				clerkId: user.id,
				workshopId: selectedWorkshopId as any,
			})
			setDeleteDialogOpen(false);
			setSelectedWorkshopId(null);
		} catch (error) {
			console.error("Failed to delete workshop:", error);
		}
	}

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp).toLocaleDateString();
	}

	return (
		<>
			<SEO
				title="Manage Workshops"
				description="Admin dashboard for managing workshops, creating new content, and editing existing workshops."
				noIndex={true}
			/>
			<div className="container mx-auto py-8 space-y-6">
				<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Manage Workshops</h1>
					<p className="text-muted-foreground mt-2">
						Create and manage workshop content
					</p>
				</div>
				<Button asChild>
					<a href="/admin/workshops/create">
						<Plus className="mr-2 h-4 w-4" />
						New Workshop
					</a>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Workshops</CardTitle>
					<CardDescription>
						{workshops?.length ?? 0} workshop(s) total
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!workshops || workshops.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No workshops found. Create your first workshop to get started.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
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
									<WorkshopRow key={workshop._id} workshop={workshop} handleDelete={handleDelete} setSelectedWorkshopId={setSelectedWorkshopId} setDeleteDialogOpen={setDeleteDialogOpen} deleteDialogOpen={deleteDialogOpen} selectedWorkshopId={selectedWorkshopId} formatDate={formatDate} />
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
			</div>
		</>
	)
}

function WorkshopRow({ workshop, handleDelete, setSelectedWorkshopId, setDeleteDialogOpen, deleteDialogOpen, selectedWorkshopId, formatDate }: any) {
	const coverAsset = useMediaAsset(workshop.coverAssetId);

	return (
		<TableRow>
			<TableCell>
				{coverAsset?.url ? (
					<img
						src={coverAsset.url}
						alt={workshop.title}
						className="w-16 h-16 object-cover rounded"
					/>
				) : (
					<div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
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
				{workshop.maxParticipants &&
					" / ${workshop.maxParticipants}"}
			</TableCell>
			<TableCell className="text-right space-x-2">
				<Button variant="ghost" size="icon" asChild>
					<a href={`/workshops/${workshop.slug}`}>
						<Eye className="h-4 w-4" />
					</a>
				</Button>
				<Button variant="ghost" size="icon" asChild>
					<a href={`/admin/workshops/${workshop._id}/edit`}>
						<Edit className="h-4 w-4" />
					</a>
				</Button>
				<Dialog
					open={
						deleteDialogOpen &&
						selectedWorkshopId === workshop._id
					}
					onOpenChange={(open) => {
						setDeleteDialogOpen(open)
						if (!open) setSelectedWorkshopId(null)
					}}
				>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSelectedWorkshopId(workshop._id)}
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Workshop</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete "{workshop.title}
								"? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setDeleteDialogOpen(false)
									setSelectedWorkshopId(null)
								}}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDelete}
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</TableCell>
		</TableRow>
	)
}

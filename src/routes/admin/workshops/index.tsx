import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	AlertCircle,
	Edit,
	Eye,
	ImageIcon,
	LayoutGrid,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteWorkshop, useWorkshops } from "@/hooks/useWorkshops";
import { api } from "@/convex/_generated/api";

export const Route = createFileRoute("/admin/workshops/")({
	component: AdminWorkshopsPage,
	loader: async () => {
		// Prefetch all workshops (including unpublished) on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
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

	const totalWorkshops = workshops?.length ?? 0;
	const publishedWorkshops =
		workshops?.filter((workshop) => workshop.isPublished).length ?? 0;
	const draftWorkshops = totalWorkshops - publishedWorkshops;
	const liveWorkshops =
		workshops?.filter((workshop) => workshop.isLive).length ?? 0;
	const upcomingWorkshops =
		workshops?.filter(
			(workshop) => workshop.startDate && workshop.startDate > Date.now(),
		).length ?? 0;
	const featuredWorkshopsCount =
		workshops?.filter((workshop) => workshop.isFeatured).length ?? 0;
	const recordingCount =
		workshops?.filter((workshop) => Boolean(workshop.videoUrl)).length ?? 0;
	const durations = (workshops ?? [])
		.map((workshop) => workshop.duration)
		.filter((value): value is number => typeof value === "number" && value > 0);
	const averageDuration = durations.length
		? `${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)} mins`
		: "—";
	const seats = (workshops ?? []).reduce(
		(acc, workshop) => {
			acc.registered += workshop.currentParticipants ?? 0;
			acc.capacity += workshop.maxParticipants ?? 0;
			return acc;
		},
		{ registered: 0, capacity: 0 },
	);
	const capacityFill =
		seats.capacity > 0
			? `${Math.min(100, Math.round((seats.registered / seats.capacity) * 100))}%`
			: "—";

	return (
		<>
			<SEO
				title="Manage Workshops"
				description="Admin dashboard for managing workshops, creating new content, and editing existing workshops."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Content management"
						title="Manage workshops"
						description="Track live sessions, recordings, and upcoming programming to keep momentum in the community."
						actions={
							<Button asChild size="lg" className="gap-2">
								<Link to="/admin/workshops/create">
									<Plus className="h-5 w-5" />
									New workshop
								</Link>
							</Button>
						}
						stats={[
							{ label: "Published", value: publishedWorkshops },
							{ label: "Drafts", value: draftWorkshops },
							{ label: "Live now", value: liveWorkshops },
							{ label: "Upcoming", value: upcomingWorkshops },
						]}
					/>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<AdminStatCard
							label="Average duration"
							value={averageDuration}
							description="Across scheduled workshops"
						/>
						<AdminStatCard
							label="Recordings available"
							value={recordingCount}
							description="Sessions with video archives"
						/>
						<AdminStatCard
							label="Featured sessions"
							value={featuredWorkshopsCount}
							description="Highlighted for visibility"
						/>
						<AdminStatCard
							label="Seats filled"
							value={capacityFill}
							description={`${seats.registered} of ${seats.capacity || "—"} reserved`}
						/>
					</div>
					<AdminTable
						title="All workshops"
						description="Manage live, upcoming, and recorded sessions from a single place."
						badge={<Badge variant="secondary">{totalWorkshops}</Badge>}
					>
						{!workshops || workshops.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<LayoutGrid className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No workshops yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Set up your first live session to kickstart engagement.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to="/admin/workshops/create">
										<Plus className="h-4 w-4" />
										Create workshop
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-20">Cover</TableHead>
											<TableHead>Workshop</TableHead>
											<TableHead>Level</TableHead>
											<TableHead>Access</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Start</TableHead>
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
					</AdminTable>
				</AdminShell>
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
					<div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
						<img
							src={workshop.coverAsset.url}
							alt={workshop.title}
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted">
						<ImageIcon className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell>
				<div className="space-y-1">
					<p className="font-medium text-foreground">{workshop.title}</p>
					<p className="line-clamp-1 text-xs text-muted-foreground">
						{workshop.shortDescription}
					</p>
					<div className="flex flex-wrap items-center gap-2">
						{workshop.isFeatured ? (
							<Badge variant="secondary">Featured</Badge>
						) : null}
					</div>
				</div>
			</TableCell>
			<TableCell>
				<Badge variant="outline">{workshop.level}</Badge>
			</TableCell>
			<TableCell>
				<Badge
					variant={
						workshop.accessLevel === "public"
							? "secondary"
							: workshop.accessLevel === "authenticated"
								? "default"
								: "destructive"
					}
				>
					{workshop.accessLevel === "public"
						? "Free"
						: workshop.accessLevel === "authenticated"
							? "Login"
							: "Subscription"}
				</Badge>
			</TableCell>
			<TableCell>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant={workshop.isPublished ? "default" : "secondary"}>
						{workshop.isPublished ? "Published" : "Draft"}
					</Badge>
					{workshop.isLive ? <Badge variant="destructive">Live</Badge> : null}
				</div>
			</TableCell>
			<TableCell>{formatDate(workshop.startDate)}</TableCell>
			<TableCell>
				{workshop.currentParticipants ?? 0}
				{workshop.maxParticipants ? ` / ${workshop.maxParticipants}` : null}
			</TableCell>
			<TableCell>
				<div className="flex justify-end gap-2">
					<Button variant="ghost" size="icon" asChild>
						<Link
							to="/workshops/$slug"
							params={{ slug: workshop.slug }}
							target="_blank"
						>
							<Eye className="h-4 w-4" />
						</Link>
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<Link to="/admin/workshops/$id/edit" params={{ id: workshop._id }}>
							<Edit className="h-4 w-4" />
						</Link>
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
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete workshop</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete "{workshop.title}"? This
									action cannot be undone.
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

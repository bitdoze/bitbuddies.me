import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	CheckCircle2,
	Loader2,
	Plus,
	RefreshCw,
	Trash2,
	Video,
	XCircle,
	Youtube,
} from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { StatBadge } from "@/components/common/StatBadge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
	useCreateYoutubeChannel,
	useRemoveYoutubeChannel,
	useUpdateYoutubeChannel,
	useYoutubeChannels,
	useYoutubeStats,
} from "@/hooks/useYoutubeChannels";
import { useSyncYoutubeChannel } from "@/hooks/useYoutubeVideos";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type LoaderData = {
	channels: Doc<"youtubeChannels">[] | null;
	stats: {
		totalChannels: number;
		activeChannels: number;
		totalVideos: number;
		videosByChannel: Array<{ channelName: string; videoCount: number }>;
		lastSyncedAt?: number;
		lastSyncStatus?: "success" | "failed";
	} | null;
};

export const Route = createFileRoute("/admin/youtube/")({
	component: AdminYouTubePage,
	loader: async () => {
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				return { channels: null, stats: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const channels = await client.query(api.youtubeChannels.list, {});
			const stats = await client.query(api.youtubeChannels.getStats, {});
			return { channels, stats };
		} catch (error) {
			console.error("Failed to prefetch YouTube data:", error);
			return { channels: null, stats: null };
		}
	},
});

type Channel = Doc<"youtubeChannels">;

function AdminYouTubePage() {
	const { user, isAdmin } = useAuth();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
	const [isSyncing, setIsSyncing] = useState<Id<"youtubeChannels"> | null>(
		null,
	);

	const loaderData = Route.useLoaderData() as LoaderData;
	const clientChannels = useYoutubeChannels();
	const clientStats = useYoutubeStats();

	const channels = (clientChannels ?? loaderData?.channels ?? []) as Channel[];
	const stats = clientStats ?? loaderData?.stats ?? null;

	const createChannel = useCreateYoutubeChannel();
	const updateChannel = useUpdateYoutubeChannel();
	const removeChannel = useRemoveYoutubeChannel();
	const syncChannel = useSyncYoutubeChannel();

	if (!isAdmin) {
		return (
			<div className="container mx-auto py-16 text-center">
				<h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
				<p className="text-muted-foreground">
					You need admin privileges to access this page.
				</p>
			</div>
		);
	}

	const handleSync = async (channelId: Id<"youtubeChannels">) => {
		setIsSyncing(channelId);
		try {
			const result = await syncChannel({ channelDbId: channelId });
			alert(
				`Sync completed!\nNew videos: ${result.newVideos}\nUpdated videos: ${result.updatedVideos}\nTotal videos: ${result.totalVideos}`,
			);
		} catch (error) {
			alert(
				`Sync failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		} finally {
			setIsSyncing(null);
		}
	};

	const handleEdit = (channel: Channel) => {
		setSelectedChannel(channel);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (channel: Channel) => {
		setSelectedChannel(channel);
		setIsDeleteDialogOpen(true);
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Never";
		return new Date(timestamp).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const heroStats = [
		{
			label: "Total Channels",
			value: `${stats?.totalChannels ?? 0}`,
			icon: <Youtube className="h-4 w-4" />,
		},
		{
			label: "Active Channels",
			value: `${stats?.activeChannels ?? 0}`,
			icon: <CheckCircle2 className="h-4 w-4" />,
		},
		{
			label: "Total Videos",
			value: `${stats?.totalVideos ?? 0}`,
			icon: <Video className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SEO
				title="YouTube Channels Management - Admin"
				description="Manage YouTube channels and video synchronization"
				noIndex
			/>

			<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
				<section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
					<div className="absolute inset-0 -z-10">
						<div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
					</div>

					<div className="container mx-auto px-4">
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h1 className="mb-2 text-3xl font-bold">
									YouTube Channels Management
								</h1>
								<p className="text-muted-foreground">
									Manage YouTube channels and sync videos automatically
								</p>
							</div>
							<Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
								<Plus className="mr-2 h-4 w-4" />
								Add Channel
							</Button>
						</div>

						<div className="flex flex-wrap gap-4">
							{heroStats.map((stat) => (
								<StatBadge key={stat.label} {...stat} />
							))}
						</div>

						{stats?.lastSyncedAt && (
							<div className="mt-4 text-sm text-muted-foreground">
								Last sync:{" "}
								<span className="font-medium">
									{formatDate(stats.lastSyncedAt)}
								</span>
							</div>
						)}
					</div>
				</section>

				<section className="py-12">
					<div className="container mx-auto px-4">
						<div className="rounded-2xl border bg-card shadow-md">
							{channels.length === 0 ? (
								<div className="p-12 text-center">
									<div className="mb-4 flex justify-center">
										<div className="rounded-full bg-muted p-4">
											<Youtube className="h-8 w-8 text-muted-foreground" />
										</div>
									</div>
									<h3 className="mb-2 text-lg font-semibold">
										No channels yet
									</h3>
									<p className="mb-6 text-sm text-muted-foreground">
										Add your first YouTube channel to start syncing videos.
									</p>
									<Button onClick={() => setIsCreateDialogOpen(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Add Channel
									</Button>
								</div>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Channel</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Videos</TableHead>
												<TableHead>Last Sync</TableHead>
												<TableHead>Sync Status</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{channels.map((channel) => (
												<TableRow key={channel._id}>
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
																<Youtube className="h-5 w-5 text-red-500" />
															</div>
															<div>
																<div className="font-medium">
																	{channel.channelName}
																</div>
																<div className="text-xs text-muted-foreground">
																	{channel.channelId}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															{channel.isActive ? (
																<>
																	<CheckCircle2 className="h-4 w-4 text-green-500" />
																	<span className="text-sm font-medium text-green-500">
																		Active
																	</span>
																</>
															) : (
																<>
																	<XCircle className="h-4 w-4 text-muted-foreground" />
																	<span className="text-sm text-muted-foreground">
																		Inactive
																	</span>
																</>
															)}
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1">
															<Video className="h-4 w-4 text-muted-foreground" />
															<span className="font-medium">
																{channel.videoCount}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-sm text-muted-foreground">
														{formatDate(channel.lastSyncedAt)}
													</TableCell>
													<TableCell>
														{channel.lastSyncStatus === "success" ? (
															<span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
																<CheckCircle2 className="h-3 w-3" />
																Success
															</span>
														) : channel.lastSyncStatus === "failed" ? (
															<span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
																<XCircle className="h-3 w-3" />
																Failed
															</span>
														) : (
															<span className="text-xs text-muted-foreground">
																Not synced
															</span>
														)}
													</TableCell>
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-2">
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleSync(channel._id)}
																disabled={isSyncing === channel._id}
															>
																{isSyncing === channel._id ? (
																	<Loader2 className="h-4 w-4 animate-spin" />
																) : (
																	<RefreshCw className="h-4 w-4" />
																)}
															</Button>
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleEdit(channel)}
															>
																Edit
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={() => handleDelete(channel)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</div>
							)}
						</div>
					</div>
				</section>
			</div>

			<CreateChannelDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onCreate={createChannel}
				clerkId={user?.id ?? ""}
			/>

			{selectedChannel && (
				<EditChannelDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					channel={selectedChannel}
					onUpdate={updateChannel}
					clerkId={user?.id ?? ""}
				/>
			)}

			{selectedChannel && (
				<DeleteChannelDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					channel={selectedChannel}
					onDelete={removeChannel}
					clerkId={user?.id ?? ""}
				/>
			)}
		</>
	);
}

function CreateChannelDialog({
	open,
	onOpenChange,
	onCreate,
	clerkId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (args: any) => Promise<any>;
	clerkId: string;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		channelId: "",
		channelName: "",
		description: "",
		isActive: true,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onCreate({
				clerkId,
				channelId: formData.channelId.trim(),
				channelName: formData.channelName.trim(),
				description: formData.description.trim() || undefined,
				isActive: formData.isActive,
			});

			setFormData({
				channelId: "",
				channelName: "",
				description: "",
				isActive: true,
			});

			onOpenChange(false);
		} catch (error) {
			alert(
				`Failed to create channel: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add YouTube Channel</DialogTitle>
					<DialogDescription>
						Add a new YouTube channel to track. Enter the channel ID from the
						channel's URL.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="channelId">Channel ID *</Label>
						<Input
							id="channelId"
							placeholder="UCGsUtKhXsRrMvYAWm8q0bCg"
							value={formData.channelId}
							onChange={(e) =>
								setFormData({ ...formData, channelId: e.target.value })
							}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Find this in the channel URL after /channel/ or @username
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="channelName">Channel Name *</Label>
						<Input
							id="channelName"
							placeholder="WEBdoze"
							value={formData.channelName}
							onChange={(e) =>
								setFormData({ ...formData, channelName: e.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Optional description..."
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="isActive">Active</Label>
						<Switch
							id="isActive"
							checked={formData.isActive}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, isActive: checked })
							}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Channel"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function EditChannelDialog({
	open,
	onOpenChange,
	channel,
	onUpdate,
	clerkId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	channel: Channel;
	onUpdate: (args: any) => Promise<any>;
	clerkId: string;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		channelName: channel.channelName,
		description: channel.description ?? "",
		isActive: channel.isActive,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onUpdate({
				clerkId,
				id: channel._id,
				channelName: formData.channelName.trim(),
				description: formData.description.trim() || undefined,
				isActive: formData.isActive,
			});

			onOpenChange(false);
		} catch (error) {
			alert(
				`Failed to update channel: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Channel</DialogTitle>
					<DialogDescription>
						Update channel information. The channel ID cannot be changed.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Channel ID</Label>
						<Input value={channel.channelId} disabled />
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-channelName">Channel Name *</Label>
						<Input
							id="edit-channelName"
							value={formData.channelName}
							onChange={(e) =>
								setFormData({ ...formData, channelName: e.target.value })
							}
							required
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
							rows={3}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="edit-isActive">Active</Label>
						<Switch
							id="edit-isActive"
							checked={formData.isActive}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, isActive: checked })
							}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Channel"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteChannelDialog({
	open,
	onOpenChange,
	channel,
	onDelete,
	clerkId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	channel: Channel;
	onDelete: (args: any) => Promise<any>;
	clerkId: string;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleDelete = async () => {
		setIsSubmitting(true);

		try {
			await onDelete({
				clerkId,
				id: channel._id,
			});

			onOpenChange(false);
		} catch (error) {
			alert(
				`Failed to delete channel: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Delete Channel</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this channel? This will also delete
						all {channel.videoCount} videos associated with it. This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg border bg-muted p-4">
					<div className="font-medium">{channel.channelName}</div>
					<div className="text-sm text-muted-foreground">
						{channel.channelId}
					</div>
					<div className="mt-2 text-sm">
						<strong>{channel.videoCount}</strong> videos will be deleted
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Channel
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

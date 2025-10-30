import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../hooks/useAuth";
import { useUpdateWorkshop, useWorkshop } from "../hooks/useWorkshops";

export const Route = createFileRoute("/admin/workshops/$id/edit")({
	component: EditWorkshopPage,
});

function EditWorkshopPage() {
	const { id } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading, convexUser } = useAuth();
	const workshop = useWorkshop(id as any);
	const updateWorkshop = useUpdateWorkshop();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		description: "",
		shortDescription: "",
		content: "",
		level: "beginner" as "beginner" | "intermediate" | "advanced",
		category: "",
		tags: "",
		duration: "",
		isLive: false,
		startDate: "",
		endDate: "",
		maxParticipants: "",
		currentParticipants: "",
		videoProvider: "" as "youtube" | "bunny" | "",
		videoId: "",
		videoUrl: "",
		accessLevel: "authenticated" as "public" | "authenticated" | "subscription",
		requiredTier: "" as "basic" | "premium" | "",
		isPublished: false,
		isFeatured: false,
	});

	// Load workshop data into form
	useEffect(() => {
		if (workshop) {
			setFormData({
				title: workshop.title,
				slug: workshop.slug,
				description: workshop.description,
				shortDescription: workshop.shortDescription || "",
				content: workshop.content,
				level: workshop.level,
				category: workshop.category || "",
				tags: workshop.tags.join(", "),
				duration: workshop.duration?.toString() || "",
				isLive: workshop.isLive,
				startDate: workshop.startDate
					? new Date(workshop.startDate).toISOString().slice(0, 16)
					: "",
				endDate: workshop.endDate
					? new Date(workshop.endDate).toISOString().slice(0, 16)
					: "",
				maxParticipants: workshop.maxParticipants?.toString() || "",
				currentParticipants: workshop.currentParticipants?.toString() || "",
				videoProvider: workshop.videoProvider || "",
				videoId: workshop.videoId || "",
				videoUrl: workshop.videoUrl || "",
				accessLevel: workshop.accessLevel,
				requiredTier: workshop.requiredTier || "",
				isPublished: workshop.isPublished,
				isFeatured: workshop.isFeatured,
			});
		}
	}, [workshop]);

	if (authLoading || workshop === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated || !convexUser) {
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
		);
	}

	if (!workshop) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Workshop Not Found</CardTitle>
						<CardDescription>
							The workshop you're trying to edit doesn't exist.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	};

	const handleTitleChange = (title: string) => {
		setFormData({
			...formData,
			title,
			slug: generateSlug(title),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const tagsArray = formData.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			const patch: any = {
				title: formData.title,
				slug: formData.slug,
				description: formData.description,
				shortDescription: formData.shortDescription || undefined,
				content: formData.content,
				level: formData.level,
				category: formData.category || undefined,
				tags: tagsArray,
				duration: formData.duration ? Number(formData.duration) : undefined,
				isLive: formData.isLive,
				startDate: formData.startDate
					? new Date(formData.startDate).getTime()
					: undefined,
				endDate: formData.endDate
					? new Date(formData.endDate).getTime()
					: undefined,
				maxParticipants: formData.maxParticipants
					? Number(formData.maxParticipants)
					: undefined,
				currentParticipants: formData.currentParticipants
					? Number(formData.currentParticipants)
					: undefined,
				videoProvider: formData.videoId ? (formData.videoProvider || "youtube") : undefined,
				videoId: formData.videoId || undefined,
				videoUrl: formData.videoUrl || undefined,
				accessLevel: formData.accessLevel,
				requiredTier: formData.requiredTier || undefined,
				isPublished: formData.isPublished,
				isFeatured: formData.isFeatured,
			};

			await updateWorkshop({
				workshopId: id as any,
				patch,
			});

			navigate({ to: "/admin/workshops" });
		} catch (error) {
			console.error("Failed to update workshop:", error);
			alert("Failed to update workshop. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto py-8 max-w-4xl">
			<div className="mb-6">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/admin/workshops" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Workshops
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Edit Workshop</CardTitle>
					<CardDescription>
						Update workshop details and content
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Basic Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Basic Information</h3>

							<div className="space-y-2">
								<Label htmlFor="title">Title *</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => handleTitleChange(e.target.value)}
									placeholder="Workshop title"
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
									placeholder="workshop-slug"
									required
								/>
								<p className="text-sm text-muted-foreground">
									URL-friendly identifier
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="shortDescription">Short Description</Label>
								<Input
									id="shortDescription"
									value={formData.shortDescription}
									onChange={(e) =>
										setFormData({
											...formData,
											shortDescription: e.target.value,
										})
									}
									placeholder="Brief one-line description"
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
									placeholder="Detailed workshop description"
									rows={4}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="content">Content *</Label>
								<Textarea
									id="content"
									value={formData.content}
									onChange={(e) =>
										setFormData({ ...formData, content: e.target.value })
									}
									placeholder="Full workshop content (supports HTML)"
									rows={8}
									required
								/>
							</div>
						</div>

						{/* Workshop Details */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Workshop Details</h3>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="level">Level *</Label>
									<Select
										value={formData.level}
										onValueChange={(value: any) =>
											setFormData({ ...formData, level: value })
										}
									>
										<SelectTrigger id="level">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="beginner">Beginner</SelectItem>
											<SelectItem value="intermediate">Intermediate</SelectItem>
											<SelectItem value="advanced">Advanced</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="duration">Duration (minutes)</Label>
									<Input
										id="duration"
										type="number"
										value={formData.duration}
										onChange={(e) =>
											setFormData({ ...formData, duration: e.target.value })
										}
										placeholder="120"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input
									id="category"
									value={formData.category}
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									placeholder="Web Development, AI, etc."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="tags">Tags</Label>
								<Input
									id="tags"
									value={formData.tags}
									onChange={(e) =>
										setFormData({ ...formData, tags: e.target.value })
									}
									placeholder="react, typescript, hooks (comma-separated)"
								/>
							</div>
						</div>

						{/* Event Details */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Event Details</h3>

							<div className="flex items-center space-x-2">
								<Switch
									id="isLive"
									checked={formData.isLive}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, isLive: checked })
									}
								/>
								<Label htmlFor="isLive">This is a live workshop</Label>
							</div>

							{formData.isLive && (
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startDate">Start Date</Label>
										<Input
											id="startDate"
											type="datetime-local"
											value={formData.startDate}
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="endDate">End Date</Label>
										<Input
											id="endDate"
											type="datetime-local"
											value={formData.endDate}
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="maxParticipants">Max Participants</Label>
										<Input
											id="maxParticipants"
											type="number"
											value={formData.maxParticipants}
											onChange={(e) =>
												setFormData({
													...formData,
													maxParticipants: e.target.value,
												})
											}
											placeholder="50"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="currentParticipants">Current Participants</Label>
										<Input
											id="currentParticipants"
											type="number"
											value={formData.currentParticipants}
											onChange={(e) =>
												setFormData({
													...formData,
													currentParticipants: e.target.value,
												})
											}
											placeholder="0"
										/>
									</div>
								</div>
							)}
						</div>

						{/* Video Details */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Video Recording (Optional)</h3>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="videoProvider">Video Provider</Label>
									<Select
										value={formData.videoProvider}
										onValueChange={(value: any) =>
											setFormData({ ...formData, videoProvider: value })
										}
									>
										<SelectTrigger id="videoProvider">
											<SelectValue placeholder="Select provider" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="youtube">YouTube</SelectItem>
											<SelectItem value="bunny">Bunny Stream</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="videoId">Video ID</Label>
									<Input
										id="videoId"
										value={formData.videoId}
										onChange={(e) =>
											setFormData({ ...formData, videoId: e.target.value })
										}
										placeholder="dQw4w9WgXcQ"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="videoUrl">Video URL (Full URL or Embed URL)</Label>
								<Input
									id="videoUrl"
									value={formData.videoUrl}
									onChange={(e) =>
										setFormData({ ...formData, videoUrl: e.target.value })
									}
									placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
								/>
								<p className="text-sm text-muted-foreground">
									Paste any YouTube URL - it will be converted to embed format automatically
								</p>
							</div>
						</div>

						{/* Access Control */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Access Control</h3>

							<div className="space-y-2">
								<Label htmlFor="accessLevel">Access Level *</Label>
								<Select
									value={formData.accessLevel}
									onValueChange={(value: any) =>
										setFormData({ ...formData, accessLevel: value })
									}
								>
									<SelectTrigger id="accessLevel">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="authenticated">
											Authenticated Users
										</SelectItem>
										<SelectItem value="subscription">Subscription Only</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{formData.accessLevel === "subscription" && (
								<div className="space-y-2">
									<Label htmlFor="requiredTier">Required Tier</Label>
									<Select
										value={formData.requiredTier}
										onValueChange={(value: any) =>
											setFormData({ ...formData, requiredTier: value })
										}
									>
										<SelectTrigger id="requiredTier">
											<SelectValue placeholder="Select tier" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="basic">Basic</SelectItem>
											<SelectItem value="premium">Premium</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</div>

						{/* Publishing Options */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Publishing Options</h3>

							<div className="space-y-3">
								<div className="flex items-center space-x-2">
									<Switch
										id="isPublished"
										checked={formData.isPublished}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, isPublished: checked })
										}
									/>
									<Label htmlFor="isPublished">Published</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Switch
										id="isFeatured"
										checked={formData.isFeatured}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, isFeatured: checked })
										}
									/>
									<Label htmlFor="isFeatured">Feature this workshop</Label>
								</div>
							</div>
						</div>

						{/* Form Actions */}
						<div className="flex justify-end space-x-4 pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/admin/workshops" })}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Workshop"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

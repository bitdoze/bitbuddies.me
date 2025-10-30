import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	Users,
	Video,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../hooks/useAuth";
import {
	useWorkshopAttachments,
	useWorkshopBySlug,
} from "../hooks/useWorkshops";

export const Route = createFileRoute("/workshops/$slug")({
	component: WorkshopPage,
});

function WorkshopPage() {
	const { slug } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const workshop = useWorkshopBySlug(slug);
	const attachments = useWorkshopAttachments(workshop?._id);

	// Convert YouTube URL to embed URL
	const embedUrl = useMemo(() => {
		console.log("Video data:", {
			videoUrl: workshop?.videoUrl,
			videoId: workshop?.videoId,
			videoProvider: workshop?.videoProvider,
		});

		if (!workshop?.videoUrl && !workshop?.videoId) return null;

		// If videoUrl is already provided, use it
		if (workshop.videoUrl) {
			// Check if it's already an embed URL
			if (workshop.videoUrl.includes('/embed/')) {
				return workshop.videoUrl;
			}
			// Try to extract video ID from various YouTube URL formats
			const videoIdMatch = workshop.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
			if (videoIdMatch) {
				return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
			}
			return workshop.videoUrl;
		}

		// Use videoId if provided
		if (workshop.videoId) {
			if (workshop.videoProvider === 'bunny') {
				return workshop.videoId; // Bunny stream URLs are used as-is
			}
			// Default to YouTube if no provider specified or if provider is youtube
			return `https://www.youtube.com/embed/${workshop.videoId}`;
		}

		return null;
	}, [workshop?.videoUrl, workshop?.videoId, workshop?.videoProvider]);

	console.log("Generated embedUrl:", embedUrl);

	if (authLoading || workshop === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Authentication Required</CardTitle>
						<CardDescription>
							You must be logged in to view this workshop.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Please sign in to access workshop content and materials.
						</p>
						<Button asChild>
							<Link to="/">Sign In</Link>
						</Button>
					</CardContent>
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
							The workshop you're looking for doesn't exist or has been removed.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline">
							<Link to="/workshops">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Workshops
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return null;
		return new Date(timestamp).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isUpcoming = workshop.startDate && workshop.startDate > Date.now();
	const isOngoing =
		workshop.startDate &&
		workshop.endDate &&
		workshop.startDate <= Date.now() &&
		workshop.endDate >= Date.now();
	const isPast = workshop.endDate && workshop.endDate < Date.now();

	return (
		<div className="container mx-auto py-8 max-w-5xl">
			<div className="mb-6">
				<Button variant="ghost" asChild>
					<Link to="/workshops">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Workshops
					</Link>
				</Button>
			</div>

			{/* Workshop Header */}
			<div className="space-y-4 mb-8">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight">
							{workshop.title}
						</h1>
						{workshop.shortDescription && (
							<p className="text-xl text-muted-foreground">
								{workshop.shortDescription}
							</p>
						)}
					</div>
					{workshop.isFeatured && (
						<Badge variant="default" className="text-sm">
							Featured
						</Badge>
					)}
				</div>

				{/* Workshop Meta */}
				<div className="flex flex-wrap gap-3">
					<Badge variant="outline" className="text-sm">
						{workshop.level}
					</Badge>
					{workshop.category && (
						<Badge variant="secondary" className="text-sm">
							{workshop.category}
						</Badge>
					)}
					{workshop.isLive && isUpcoming && (
						<Badge variant="default" className="text-sm">
							Upcoming Live
						</Badge>
					)}
					{workshop.isLive && isOngoing && (
						<Badge variant="destructive" className="text-sm">
							Live Now
						</Badge>
					)}
					{workshop.isLive && isPast && (
						<Badge variant="secondary" className="text-sm">
							Ended
						</Badge>
					)}
				</div>

				{workshop.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{workshop.tags.map((tag) => (
							<span
								key={tag}
								className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
							>
								#{tag}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Video Player - Full Width at Top */}
			{(embedUrl || workshop.videoId || workshop.videoUrl) && (
				<div className="mb-8">
					<Card>
						<CardHeader>
							<CardTitle>
								<Video className="inline-block mr-2 h-5 w-5" />
								Workshop Recording
							</CardTitle>
						</CardHeader>
						<CardContent>
							{embedUrl ? (
								<div className="aspect-video w-full">
									<iframe
										src={embedUrl}
										className="w-full h-full rounded-lg"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										title={workshop.title}
									/>
								</div>
							) : (
								<div className="bg-muted p-4 rounded-lg">
									<p className="text-sm font-medium mb-2">Video configuration issue</p>
									<pre className="text-xs bg-background p-2 rounded overflow-auto">
										{JSON.stringify(
											{
												videoUrl: workshop.videoUrl,
												videoId: workshop.videoId,
												videoProvider: workshop.videoProvider,
												generatedEmbedUrl: embedUrl,
											},
											null,
											2
										)}
									</pre>
									<p className="text-xs text-muted-foreground mt-2">
										Please contact the workshop administrator to fix the video settings.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Description Card */}
					<Card>
						<CardHeader>
							<CardTitle>About This Workshop</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{workshop.description}
							</p>
						</CardContent>
					</Card>

					{/* Content Card */}
					<Card>
						<CardHeader>
							<CardTitle>Workshop Content</CardTitle>
						</CardHeader>
						<CardContent>
							<div
								className="prose prose-sm max-w-none dark:prose-invert"
								dangerouslySetInnerHTML={{ __html: workshop.content }}
							/>
						</CardContent>
					</Card>

					{/* Attachments */}
					{attachments && attachments.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Workshop Materials</CardTitle>
								<CardDescription>
									Download resources and materials for this workshop
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{attachments.map((attachment: any) => (
										<div
											key={attachment._id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
										>
											<div className="flex items-center space-x-3">
												<Download className="h-4 w-4 text-muted-foreground" />
												<div>
													<p className="font-medium">
														{attachment.displayName}
													</p>
													{attachment.asset && (
														<p className="text-xs text-muted-foreground">
															{attachment.asset.mimeType} •{" "}
															{(
																attachment.asset.filesize /
																1024 /
																1024
															).toFixed(2)}{" "}
															MB
														</p>
													)}
												</div>
											</div>
											{attachment.asset?.url && (
												<Button size="sm" variant="ghost" asChild>
													<a
														href={attachment.asset.url}
														download
														target="_blank"
														rel="noopener noreferrer"
													>
														Download
													</a>
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Workshop Info */}
					<Card>
						<CardHeader>
							<CardTitle>Workshop Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{workshop.duration && (
								<div className="flex items-start space-x-3">
									<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium text-sm">Duration</p>
										<p className="text-sm text-muted-foreground">
											{workshop.duration} minutes
										</p>
									</div>
								</div>
							)}

							{workshop.startDate && (
								<div className="flex items-start space-x-3">
									<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium text-sm">
											{isUpcoming ? "Starts" : isPast ? "Started" : "Started"}
										</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(workshop.startDate)}
										</p>
									</div>
								</div>
							)}

							{workshop.endDate && (
								<div className="flex items-start space-x-3">
									<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium text-sm">
											{isPast ? "Ended" : "Ends"}
										</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(workshop.endDate)}
										</p>
									</div>
								</div>
							)}

							{workshop.maxParticipants && (
								<div className="flex items-start space-x-3">
									<Users className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium text-sm">Participants</p>
										<p className="text-sm text-muted-foreground">
											{workshop.currentParticipants} /{" "}
											{workshop.maxParticipants}
										</p>
									</div>
								</div>
							)}

							{workshop.instructorName && (
								<div>
									<Separator className="my-4" />
									<div>
										<p className="font-medium text-sm mb-1">Instructor</p>
										<p className="text-sm text-muted-foreground">
											{workshop.instructorName}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Enrollment Status */}
					<Card>
						<CardHeader>
							<CardTitle>Enrollment Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
								<CheckCircle2 className="h-5 w-5" />
								<span className="font-medium">You have access</span>
							</div>
							<p className="text-sm text-muted-foreground mt-2">
								You're enrolled and can access all workshop materials.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

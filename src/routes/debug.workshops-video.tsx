import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";

export const Route = createFileRoute("/debug/workshops-video")({
	component: WorkshopsVideoDebugPage,
});

function WorkshopsVideoDebugPage() {
	const workshops = useQuery(api.workshops.list, { publishedOnly: false });
	const updateWorkshop = useMutation(api.workshops.update);
	const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");
	const [videoUrl, setVideoUrl] = useState("");
	const [videoId, setVideoId] = useState("");
	const [videoProvider, setVideoProvider] = useState<"youtube" | "bunny">("youtube");

	const workshop = workshops?.find((w) => w._id === selectedWorkshop);

	const extractVideoId = (url: string) => {
		const match = url.match(
			/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
		);
		return match ? match[1] : null;
	};

	const extractEmbedUrlFromIframe = (html: string) => {
		// Extract src attribute from iframe HTML
		const srcMatch = html.match(/src=["']([^"']+)["']/);
		if (srcMatch) {
			const src = srcMatch[1];
			// Remove query parameters like ?si=...
			return src.split('?')[0];
		}
		return null;
	};

	const handleLoadFromWorkshop = () => {
		if (workshop) {
			setVideoUrl(workshop.videoUrl || "");
			setVideoId(workshop.videoId || "");
			setVideoProvider(workshop.videoProvider || "youtube");
		}
	};

	const handleExtractId = () => {
		if (videoUrl) {
			// First check if it's an iframe HTML
			if (videoUrl.includes('<iframe')) {
				const embedUrl = extractEmbedUrlFromIframe(videoUrl);
				if (embedUrl) {
					setVideoUrl(embedUrl);
					const id = extractVideoId(embedUrl);
					if (id) {
						setVideoId(id);
						alert(`Extracted from iframe!\nEmbed URL: ${embedUrl}\nVideo ID: ${id}`);
						return;
					}
				}
			}

			// Try to extract from URL
			const id = extractVideoId(videoUrl);
			if (id) {
				setVideoId(id);
				alert(`Extracted video ID: ${id}`);
			} else {
				alert("Could not extract video ID from URL");
			}
		}
	};

	const handleUpdate = async () => {
		if (!selectedWorkshop) {
			alert("Please select a workshop");
			return;
		}

		try {
			await updateWorkshop({
				workshopId: selectedWorkshop as any,
				patch: {
					videoUrl: videoUrl || undefined,
					videoId: videoId || undefined,
					videoProvider: videoId ? videoProvider : undefined,
				},
			});
			alert("Workshop video settings updated!");
		} catch (error) {
			console.error("Failed to update workshop:", error);
			alert(`Failed to update: ${error}`);
		}
	};

	const getEmbedUrl = (
		videoUrl?: string,
		videoId?: string,
		videoProvider?: string
	) => {
		if (videoUrl) {
			// Check if it's iframe HTML
			if (videoUrl.includes('<iframe')) {
				const embedUrl = extractEmbedUrlFromIframe(videoUrl);
				if (embedUrl) {
					return embedUrl.split('?')[0]; // Remove query params
				}
				return null;
			}

			if (videoUrl.includes("/embed/")) {
				return videoUrl.split('?')[0]; // Remove query params
			}
			const id = extractVideoId(videoUrl);
			if (id) {
				return `https://www.youtube.com/embed/${id}`;
			}
			return videoUrl;
		}

		if (videoId) {
			if (videoProvider === "bunny") {
				return videoId;
			}
			return `https://www.youtube.com/embed/${videoId}`;
		}

		return null;
	};

	const currentEmbedUrl = getEmbedUrl(videoUrl, videoId, videoProvider);
	const workshopEmbedUrl = workshop
		? getEmbedUrl(workshop.videoUrl, workshop.videoId, workshop.videoProvider)
		: null;

	return (
		<div className="container mx-auto py-8 max-w-4xl space-y-6">
			<h1 className="text-3xl font-bold">Workshop Video Debug Tool</h1>

			{/* Workshop Selector */}
			<Card>
				<CardHeader>
					<CardTitle>Select Workshop</CardTitle>
					<CardDescription>Choose a workshop to inspect or fix</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Select value={selectedWorkshop} onValueChange={setSelectedWorkshop}>
						<SelectTrigger>
							<SelectValue placeholder="Select a workshop" />
						</SelectTrigger>
						<SelectContent>
							{workshops?.map((w) => (
								<SelectItem key={w._id} value={w._id}>
									{w.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{workshop && (
						<div className="space-y-2">
							<h4 className="font-semibold">Current Video Data:</h4>
							<pre className="bg-muted p-3 rounded text-xs overflow-auto">
								{JSON.stringify(
									{
										videoUrl: workshop.videoUrl || null,
										videoId: workshop.videoId || null,
										videoProvider: workshop.videoProvider || null,
										generatedEmbedUrl: workshopEmbedUrl,
									},
									null,
									2
								)}
							</pre>
							<Button onClick={handleLoadFromWorkshop} variant="outline">
								Load into Form
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Video Editor */}
			<Card>
				<CardHeader>
					<CardTitle>Update Video Settings</CardTitle>
					<CardDescription>
						Fix or update the video configuration
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="videoUrl">Video URL</Label>
						<Input
							id="videoUrl"
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=..."
						/>
						<Button onClick={handleExtractId} variant="outline" size="sm">
							Extract Video ID from URL/iframe
						</Button>
						<p className="text-xs text-muted-foreground">
							Paste any YouTube URL or iframe embed code
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="videoId">Video ID</Label>
							<Input
								id="videoId"
								value={videoId}
								onChange={(e) => setVideoId(e.target.value)}
								placeholder="dQw4w9WgXcQ"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="videoProvider">Video Provider</Label>
							<Select
								value={videoProvider}
								onValueChange={(value: any) => setVideoProvider(value)}
							>
								<SelectTrigger id="videoProvider">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="youtube">YouTube</SelectItem>
									<SelectItem value="bunny">Bunny Stream</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="font-semibold">Generated Embed URL:</h4>
						<pre className="bg-muted p-3 rounded text-xs overflow-auto">
							{currentEmbedUrl || "null"}
						</pre>
					</div>

					<div className="flex gap-2">
						<Button onClick={handleUpdate} disabled={!selectedWorkshop}>
							Update Workshop
						</Button>
						{workshop?.videoUrl?.includes('<iframe') && (
							<Button
								onClick={async () => {
									if (!workshop?.videoUrl) return;
									const embedUrl = extractEmbedUrlFromIframe(workshop.videoUrl);
									const id = extractVideoId(workshop.videoUrl);
									if (embedUrl && id) {
										try {
											await updateWorkshop({
												workshopId: selectedWorkshop as any,
												patch: {
													videoUrl: undefined,
													videoId: id,
													videoProvider: "youtube",
												},
											});
											alert("Fixed! Removed iframe HTML and set video ID.");
											setVideoUrl("");
											setVideoId(id);
											setVideoProvider("youtube");
										} catch (error) {
											console.error("Failed to fix:", error);
											alert(`Failed to fix: ${error}`);
										}
									}
								}}
								variant="destructive"
							>
								Quick Fix: Remove iframe HTML
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Video Preview */}
			{currentEmbedUrl && (
				<Card>
					<CardHeader>
						<CardTitle>Preview</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="aspect-video w-full">
							<iframe
								src={currentEmbedUrl}
								className="w-full h-full rounded-lg"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								title="Video Preview"
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* All Workshops Overview */}
			<Card>
				<CardHeader>
					<CardTitle>All Workshops Video Status</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{workshops?.map((w) => {
							const embedUrl = getEmbedUrl(w.videoUrl, w.videoId, w.videoProvider);
							return (
								<div
									key={w._id}
									className="flex items-center justify-between p-3 border rounded"
								>
									<div>
										<p className="font-medium">{w.title}</p>
										<p className="text-xs text-muted-foreground">
											{embedUrl ? "✅ Video configured" : "❌ No video"}
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedWorkshop(w._id)}
									>
										Inspect
									</Button>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

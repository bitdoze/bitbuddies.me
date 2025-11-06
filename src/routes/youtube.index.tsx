import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	ArrowUpRight,
	CalendarClock,
	Filter,
	RefreshCw,
	Video,
	Youtube,
} from "lucide-react";
import { useState } from "react";
import { SEO, SEO_CONFIGS } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatBadge } from "@/components/common/StatBadge";
import { YouTubeVideoCard } from "@/components/content";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useYoutubeChannelList,
	useYoutubeVideos,
} from "@/hooks/useYoutubeVideos";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type LoaderData = {
	videos: {
		videos: Doc<"youtubeVideos">[];
		hasMore: boolean;
		nextCursor: number | null;
	} | null;
	channelList: Array<{
		id: string;
		channelId: string;
		channelName: string;
		videoCount: number;
	}> | null;
};

type ChannelListItem = NonNullable<LoaderData["channelList"]>[number];
type DateFilterValue = "all" | "1d" | "2d" | "7d";

export const Route = createFileRoute("/youtube/")({
	component: YouTubePage,
	loader: async () => {
		// Prefetch videos data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { videos: null, channelList: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const videosData = await client.query(api.youtubeVideos.list, {
				limit: 12,
			});
			const channelList = await client.query(
				api.youtubeVideos.getChannelList,
				{},
			);
			return { videos: videosData, channelList };
		} catch (error) {
			console.error("Failed to prefetch YouTube videos:", error);
			return { videos: null, channelList: null };
		}
	},
});

type VideoData = Doc<"youtubeVideos">;

function YouTubePage() {
	const [selectedChannelId, setSelectedChannelId] = useState<string>("all");
	const [cursor, setCursor] = useState<number>(0);
	const [dateFilter, setDateFilter] = useState<DateFilterValue>("all");
	const [publishedAfter, setPublishedAfter] = useState<number | undefined>(
		undefined,
	);

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData() as LoaderData;
	const clientVideosData = useYoutubeVideos({
		channelRef:
			selectedChannelId === "all"
				? undefined
				: (selectedChannelId as Id<"youtubeChannels">),
		limit: 12,
		cursor,
		publishedAfter,
	});
	const clientChannelList = useYoutubeChannelList();

	const channelList = (clientChannelList ??
		loaderData?.channelList ??
		[]) as ChannelListItem[];

	// Prefer loader data for initial load when no filters are applied, then use client data
	const shouldUseLoader =
		selectedChannelId === "all" &&
		cursor === 0 &&
		dateFilter === "all" &&
		Boolean(loaderData?.videos);
	const videosData = shouldUseLoader ? loaderData?.videos : clientVideosData;

	const videos = videosData?.videos ?? [];
	const hasMore = videosData?.hasMore ?? false;
	const nextCursor = videosData?.nextCursor ?? null;

	const handleLoadMore = () => {
		if (nextCursor !== null) {
			setCursor(nextCursor);
		}
	};

	const handleChannelFilter = (value: string) => {
		setSelectedChannelId(value);
		setCursor(0);
	};

	const handleChannelCardClick = (channelId: string) => {
		if (selectedChannelId === channelId) {
			handleChannelFilter("all");
			return;
		}
		handleChannelFilter(channelId);
	};

	const handleDateFilterChange = (value: DateFilterValue) => {
		setDateFilter(value);
		if (value === "all") {
			setPublishedAfter(undefined);
		} else {
			const days = value === "1d" ? 1 : value === "2d" ? 2 : 7;
			const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
			setPublishedAfter(cutoff);
		}
		setCursor(0);
	};

	const heroStats = [
		{
			label: "Video tutorials",
			value: `${videos.length}+`,
			icon: <Video className="h-4 w-4" />,
		},
		{
			label: "YouTube channels",
			value: `${channelList.length}`,
			icon: <Youtube className="h-4 w-4" />,
		},
		{
			label: "Latest updates",
			value: "Daily",
			icon: <RefreshCw className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SEO
				{...SEO_CONFIGS.youtube}
				canonicalUrl="/youtube"
				ogImage="/og-youtube.jpg"
			/>

			<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
				{/* Hero Section */}
				<section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
					{/* Decorative Elements */}
					<div className="absolute inset-0 -z-10">
						<div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
					</div>

					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-4xl text-center">
							{/* Badge */}
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
								<Youtube className="h-4 w-4 text-red-500" />
								<span className="font-medium">Curated Video Collection</span>
							</div>

							{/* Heading */}
							<h1 className="mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
								Latest YouTube Videos
							</h1>

							{/* Description */}
							<p className="mb-8 text-lg text-muted-foreground md:text-xl">
								Stay updated with the latest tutorials, guides, and insights
								from our favorite YouTube channels. Fresh content added daily.
							</p>

							{/* Stats */}
							<div className="flex flex-wrap items-center justify-center gap-4">
								{heroStats.map((stat) => (
									<StatBadge key={stat.label} {...stat} />
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Filter Section */}
				<section className="border-b bg-card/50 py-6 backdrop-blur-sm">
					<div className="container mx-auto px-4">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
								<div className="flex items-center gap-2">
									<Filter className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm font-medium text-muted-foreground">
										Filter by channel
									</span>
								</div>
								<Select
									value={selectedChannelId}
									onValueChange={handleChannelFilter}
								>
									<SelectTrigger className="w-full md:w-[260px] lg:w-[280px]">
										<SelectValue placeholder="All channels" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All channels</SelectItem>
										{channelList.map((channel) => (
											<SelectItem key={channel.id} value={channel.id}>
												{channel.channelName} ({channel.videoCount})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
								<div className="flex items-center gap-2">
									<CalendarClock className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm font-medium text-muted-foreground">
										Added within
									</span>
								</div>
								<Select
									value={dateFilter}
									onValueChange={(value) =>
										handleDateFilterChange(value as DateFilterValue)
									}
								>
									<SelectTrigger className="w-full md:w-[220px] lg:w-[240px]">
										<SelectValue placeholder="Any time" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Any time</SelectItem>
										<SelectItem value="1d">Last 24 hours</SelectItem>
										<SelectItem value="2d">Last 48 hours</SelectItem>
										<SelectItem value="7d">Last 7 days</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</section>

				{/* Channels Section */}
				{channelList.length > 0 ? (
					<section className="border-b bg-background py-16">
						<div className="container mx-auto px-4">
							<SectionHeader
								icon={<Youtube className="h-4 w-4" />}
								eyebrow="Featured sources"
								title="YouTube channels we monitor"
								description="Tap a channel to filter the grid or jump straight to their latest uploads."
							/>
							<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{channelList.map((channel) => {
									const channelUrl = `https://www.youtube.com/channel/${channel.channelId}`;
									const isActive = selectedChannelId === channel.id;
									return (
										<div
											key={channel.id}
											className={cn(
												"space-y-5 rounded-2xl border bg-card/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
												isActive ? "border-primary shadow-lg" : "border-border",
											)}
										>
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
														<Youtube className="h-5 w-5" />
													</div>
													<div className="text-left">
														<p className="text-base font-semibold text-foreground">
															{channel.channelName}
														</p>
														<p className="text-xs text-muted-foreground">
															{channel.channelId}
														</p>
													</div>
												</div>
												<span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
													{channel.videoCount} videos
												</span>
											</div>
											<div className="flex items-center justify-between gap-3 text-sm">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleChannelCardClick(channel.id)}
												>
													{isActive ? "Clear filter" : "Filter videos"}
												</Button>
												<a
													href={channelUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
												>
													Visit channel
													<ArrowUpRight className="h-4 w-4" />
												</a>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</section>
				) : null}

				{/* Videos Grid */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						{videos.length === 0 ? (
							<div className="mx-auto max-w-md rounded-2xl border bg-card p-12 text-center shadow-sm">
								<div className="mb-4 flex justify-center">
									<div className="rounded-full bg-muted p-4">
										<Video className="h-8 w-8 text-muted-foreground" />
									</div>
								</div>
								<h3 className="mb-2 text-lg font-semibold">No videos yet</h3>
								<p className="text-sm text-muted-foreground">
									Videos will appear here once channels are added and synced.
								</p>
							</div>
						) : (
							<>
								<div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{videos.map((video: VideoData) => (
										<YouTubeVideoCard key={video._id} video={video} />
									))}
								</div>

								{/* Load More */}
								{hasMore && (
									<div className="flex justify-center">
										<Button
											size="lg"
											variant="outline"
											onClick={handleLoadMore}
											className="group"
										>
											Load More Videos
											<RefreshCw className="ml-2 h-4 w-4 transition-transform group-hover:rotate-180" />
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				</section>
			</div>
		</>
	);
}

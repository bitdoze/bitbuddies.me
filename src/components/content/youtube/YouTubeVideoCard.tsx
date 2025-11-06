import { ArrowUpRight, Calendar, Eye, Play, Youtube } from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { ContentCard } from "../ContentCard";

type YouTubeVideo = Doc<"youtubeVideos">;

type YouTubeVideoCardProps = {
	video: YouTubeVideo;
	className?: string;
};

const formatDate = (timestamp?: number) => {
	if (!timestamp) return "";
	return new Date(timestamp).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const formatViews = (views?: number) => {
	if (!views || views <= 0) return undefined;
	if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
	if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
	return `${views} views`;
};

export function YouTubeVideoCard({ video, className }: YouTubeVideoCardProps) {
	const meta = [
		video.publishedAt
			? {
					icon: <Calendar className="h-3.5 w-3.5" />,
					label: formatDate(video.publishedAt),
				}
			: undefined,
		formatViews(video.views)
			? {
					icon: <Eye className="h-3.5 w-3.5" />,
					label: formatViews(video.views)!,
				}
			: undefined,
	].filter(Boolean) as Array<{ icon: JSX.Element; label: string }>;

	return (
		<a
			href={video.videoUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="block h-full"
			aria-label={`Watch ${video.title} on YouTube`}
		>
			<ContentCard
				className={className}
				title={video.title}
				description={video.description}
				badges={[{ label: "YouTube", variant: "secondary" }]}
				meta={meta}
				cover={
					<div className="relative aspect-[16/9] overflow-hidden">
						<img
							src={video.thumbnailUrl}
							alt={video.title}
							loading="lazy"
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />
						<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							<div className="rounded-full bg-red-600 p-4 shadow-lg">
								<Play className="h-6 w-6 text-white" />
							</div>
						</div>
						<div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
							<Youtube className="h-3.5 w-3.5 text-red-400" />
							<span className="line-clamp-1 max-w-[160px]">
								{video.channelName}
							</span>
						</div>
					</div>
				}
				footer={
					<div className="flex items-center gap-2 text-sm font-semibold text-primary">
						<span>Watch on YouTube</span>
						<ArrowUpRight className="h-4 w-4" />
					</div>
				}
			/>
		</a>
	);
}

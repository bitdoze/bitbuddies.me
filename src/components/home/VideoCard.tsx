import { Link } from "@tanstack/react-router";
import { PlayCircle, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type VideoCardProps = {
	video: Doc<"youtubeVideos">;
	className?: string;
};

const formatDate = (value?: string | number | null) => {
	if (!value) return "";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
};

const formatNumber = (num?: number) => {
	if (!num) return "0";
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
};

export function VideoCard({ video, className }: VideoCardProps) {
	return (
		<Link
			to="/youtube"
			search={{ v: video.videoId }}
			className={cn("group block", className)}
		>
			<article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30 hover:-translate-y-1">
				{/* Thumbnail */}
				<div className="relative aspect-video overflow-hidden bg-muted">
					{video.thumbnailUrl ? (
						<>
							<img
								src={video.thumbnailUrl}
								alt={video.title}
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
						</>
					) : (
						<div className="h-full w-full bg-linear-to-br from-emerald-500/20 via-teal-500/10 to-green-500/20 flex items-center justify-center">
							<PlayCircle className="h-16 w-16 text-muted-foreground/30" />
						</div>
					)}

					{/* Play Button Overlay */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/90 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600">
							<PlayCircle className="h-8 w-8 text-white fill-white" />
						</div>
					</div>

					{/* View Count Badge */}
					{video.views !== undefined && (
						<div className="absolute bottom-3 right-3">
							<Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm font-semibold">
								{formatNumber(video.views)} views
							</Badge>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="p-4 space-y-2.5">
					{/* Title */}
					<h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
						{video.title}
					</h3>

					{/* Description */}
					{video.description && (
						<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
							{video.description}
						</p>
					)}

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
						{video.publishedAt && (
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								<span>{formatDate(video.publishedAt)}</span>
							</div>
						)}
						{video.views !== undefined && (
							<div className="flex items-center gap-1">
								<Eye className="h-3 w-3" />
								<span>{formatNumber(video.views)} views</span>
							</div>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}

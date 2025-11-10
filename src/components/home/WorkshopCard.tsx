import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type WorkshopCardProps = {
	workshop: Doc<"workshops"> & {
		coverAsset: Doc<"mediaAssets"> | null;
	};
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

export function WorkshopCard({ workshop, className }: WorkshopCardProps) {
	return (
		<Link
			to="/workshops/$slug"
			params={{ slug: workshop.slug }}
			className={cn("group block", className)}
		>
			<article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-sky-500/30 hover:-translate-y-1">
				{/* Cover Image */}
				{workshop.coverAsset?.url ? (
					<div className="relative aspect-video overflow-hidden bg-muted">
						<img
							src={workshop.coverAsset.url}
							alt={workshop.title}
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent" />

						{/* Badges on Image */}
						<div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end">
							{workshop.isLive && (
								<Badge variant="destructive" className="font-bold shadow-lg">
									Live
								</Badge>
							)}
							{workshop.isFeatured && (
								<Badge variant="outline" className="bg-background/90 backdrop-blur-sm font-semibold border-amber-500/50">
									<Sparkles className="h-3 w-3 mr-1" />
									Featured
								</Badge>
							)}
						</div>
					</div>
				) : (
					<div className="relative aspect-video bg-linear-to-br from-sky-500/20 via-cyan-500/10 to-blue-500/20 flex items-center justify-center">
						<Calendar className="h-12 w-12 text-muted-foreground/30" />
					</div>
				)}

				{/* Content */}
				<div className="p-4 space-y-2.5">
					{/* Level Badge */}
					<div>
						<Badge variant="secondary" className="text-xs">
							{workshop.level}
						</Badge>
					</div>

					{/* Title */}
					<h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
						{workshop.title}
					</h3>

					{/* Description */}
					{(workshop.shortDescription || workshop.description) && (
						<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
							{workshop.shortDescription || workshop.description}
						</p>
					)}

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
						{workshop.startDate && (
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								<span>{formatDate(workshop.startDate)}</span>
							</div>
						)}
						{workshop.duration && (
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{workshop.duration}m</span>
							</div>
						)}
						{workshop.currentParticipants && (
							<div className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								<span>{workshop.currentParticipants}</span>
							</div>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}

import { Link } from "@tanstack/react-router";
import { Calendar, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type BlogPostCardProps = {
	post: Doc<"posts"> & {
		coverAsset: any;
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

export function BlogPostCard({ post, className }: BlogPostCardProps) {
	return (
		<Link
			to="/posts/$slug"
			params={{ slug: post.slug }}
			className={cn("group block", className)}
		>
			<article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-slate-500/30 hover:-translate-y-1">
				{/* Cover Image */}
				{post.coverAsset?.url ? (
					<div className="relative aspect-video overflow-hidden bg-muted">
						<img
							src={post.coverAsset.url}
							alt={post.title}
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent" />

						{/* Category Badge on Image */}
						{post.category && (
							<div className="absolute top-3 right-3">
								<Badge variant="secondary" className="bg-background/90 backdrop-blur-sm font-semibold">
									{post.category}
								</Badge>
							</div>
						)}
					</div>
				) : (
					<div className="relative aspect-video bg-linear-to-br from-slate-500/20 via-gray-500/10 to-zinc-500/20 flex items-center justify-center">
						<FileText className="h-12 w-12 text-muted-foreground/30" />
					</div>
				)}

				{/* Content */}
				<div className="p-4 space-y-2.5">
					{/* Title */}
					<h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
						{post.title}
					</h3>

					{/* Description */}
					{(post.excerpt || post.metaDescription) && (
						<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
							{post.excerpt || post.metaDescription}
						</p>
					)}

					{/* Meta Info */}
					<div className="flex items-center gap-2.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
						{post.publishedAt && (
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								<span>{formatDate(post.publishedAt)}</span>
							</div>
						)}
						{post.readTime && (
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{post.readTime} min read</span>
							</div>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}

import { Link } from "@tanstack/react-router";
import { BookOpen, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type CourseCardProps = {
	course: Doc<"courses"> & {
		coverAsset: Doc<"mediaAssets"> | null;
	};
	className?: string;
};

export function CourseCard({ course, className }: CourseCardProps) {
	return (
		<Link
			to="/courses/$slug"
			params={{ slug: course.slug }}
			className={cn("group block", className)}
		>
			<article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
				{/* Cover Image */}
				{course.coverAsset?.url ? (
					<div className="relative aspect-video overflow-hidden bg-muted">
						<img
							src={course.coverAsset.url}
							alt={course.title}
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent" />

						{/* Level Badge on Image */}
						<div className="absolute top-3 right-3">
							<Badge variant="secondary" className="bg-background/90 backdrop-blur-sm font-semibold">
								{course.level}
							</Badge>
						</div>
					</div>
				) : (
					<div className="relative aspect-video bg-linear-to-br from-violet-500/20 via-purple-500/10 to-indigo-500/20 flex items-center justify-center">
						<BookOpen className="h-12 w-12 text-muted-foreground/30" />
					</div>
				)}

				{/* Content */}
				<div className="p-4 space-y-2.5">
					{/* Title */}
					<h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
						{course.title}
					</h3>

					{/* Description */}
					{(course.shortDescription || course.description) && (
						<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
							{course.shortDescription || course.description}
						</p>
					)}

					{/* Meta Info */}
					<div className="flex items-center justify-between pt-2 border-t border-border/50">
						<div className="flex items-center gap-2.5 text-xs text-muted-foreground">
							{course.duration && (
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									<span>{course.duration}m</span>
								</div>
							)}
							{course.enrollmentCount && (
								<div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									<span>{course.enrollmentCount}</span>
								</div>
							)}
						</div>

						{course.accessLevel === "subscription" && (
							<Badge variant="default" className="text-xs">Premium</Badge>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}

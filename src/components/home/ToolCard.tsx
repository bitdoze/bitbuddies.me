import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ToolCardProps = {
	tool: {
		slug: string;
		name: string;
		description: string;
		category: string;
		icon: string;
	};
	className?: string;
};

const buildToolIconSrc = (svg: string) =>
	`data:image/svg+xml,${encodeURIComponent(svg)}`;

export function ToolCard({ tool, className }: ToolCardProps) {
	return (
		<Link
			to="/tools/$toolSlug"
			params={{ toolSlug: tool.slug }}
			className={cn("group block", className)}
		>
			<article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 hover:-translate-y-1">
				{/* Header with Icon */}
				<div className="relative p-4 pb-3 bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent">
					<div className="flex items-start gap-3">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20 transition-all duration-300 group-hover:bg-amber-500/25 group-hover:ring-amber-500/30 group-hover:scale-110">
							<img
								src={buildToolIconSrc(tool.icon)}
								alt=""
								className="h-6 w-6"
								aria-hidden="true"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<Badge variant="secondary" className="text-xs mb-1.5">
								{tool.category}
							</Badge>
							<h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
								{tool.name}
							</h3>
						</div>
					</div>

					{/* Decorative sparkle */}
					<Sparkles className="absolute top-3 right-3 h-3.5 w-3.5 text-amber-500/30" />
				</div>

				{/* Content */}
				<div className="p-4 pt-3 space-y-3">
					{/* Description */}
					<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3">
						{tool.description}
					</p>

					{/* CTA */}
					<div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs font-semibold text-amber-600 dark:text-amber-400">
						<span>Open tool</span>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
					</div>
				</div>
			</article>
		</Link>
	);
}

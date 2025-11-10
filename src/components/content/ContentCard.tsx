import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeConfig = {
	label: string;
	variant?: "default" | "secondary" | "outline" | "destructive";
};

type MetaConfig = {
	icon: ReactNode;
	label: string;
};

type ContentCardProps = {
	cover?: ReactNode;
	title: ReactNode;
	subtitle?: ReactNode;
	description?: ReactNode;
	badges?: BadgeConfig[];
	meta?: MetaConfig[];
	footer?: ReactNode;
	className?: string;
};

export function ContentCard({
	cover,
	title,
	subtitle,
	description,
	badges,
	meta,
	footer,
	className,
}: ContentCardProps) {
	return (
		<article
			className={cn(
				"group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-2",
				className,
			)}
		>
			{/* Cover image */}
			{cover ? (
				<div className="relative overflow-hidden">
					{cover}
					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

					{/* Shine effect on hover */}
					<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
				</div>
			) : null}

			{/* Content */}
			<div className="flex flex-1 flex-col gap-4 p-6">
				{/* Badges */}
				{badges && badges.length > 0 ? (
					<div className="flex flex-wrap items-center gap-2">
						{badges.map((badge, index) => (
							<span
								key={`${badge.label}-${index}`}
								className={cn(
									"inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200",
									badge.variant === "secondary" &&
										"bg-secondary/80 text-secondary-foreground hover:bg-secondary",
									badge.variant === "outline" &&
										"border-2 border-border bg-background/50 text-foreground hover:border-primary/50",
									badge.variant === "destructive" &&
										"bg-destructive/15 text-destructive font-bold ring-1 ring-destructive/30",
									(!badge.variant || badge.variant === "default") &&
										"bg-primary/15 text-primary ring-1 ring-primary/20 hover:bg-primary/25",
								)}
							>
								{badge.label}
							</span>
						))}
					</div>
				) : null}

				{/* Title and description */}
				<div className="space-y-3 flex-1">
					{subtitle ? (
						<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
							{subtitle}
						</p>
					) : null}

					{typeof title === "string" ? (
						<h3 className="line-clamp-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary leading-tight">
							{title}
						</h3>
					) : (
						title
					)}

					{description ? (
						<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/90">
							{description}
						</p>
					) : null}
				</div>

				{/* Meta info */}
				{meta && meta.length > 0 ? (
					<ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground border-t border-border/50 pt-4">
						{meta.map((item, index) => (
							<li
								key={`${item.label}-${index}`}
								className="flex items-center gap-2 font-medium"
							>
								<span className="text-primary/80">{item.icon}</span>
								<span>{item.label}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>

			{/* Footer */}
			{footer ? <div className="px-6 pb-6 pt-0">{footer}</div> : null}
		</article>
	);
}

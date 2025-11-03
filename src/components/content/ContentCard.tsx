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
				"group relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1",
				className,
			)}
		>
			{/* Cover image with overlay gradient */}
			{cover ? (
				<div className="relative overflow-hidden">
					{cover}
					{/* Subtle gradient overlay on hover */}
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</div>
			) : null}

			{/* Content */}
			<div className="flex flex-1 flex-col gap-3 p-5">
				{/* Badges */}
				{badges && badges.length > 0 ? (
					<div className="flex flex-wrap items-center gap-1.5">
						{badges.map((badge, index) => (
							<span
								key={`${badge.label}-${index}`}
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
									badge.variant === "secondary" &&
										"bg-muted text-muted-foreground",
									badge.variant === "outline" &&
										"border border-border bg-transparent text-foreground",
									badge.variant === "destructive" &&
										"bg-destructive/10 text-destructive font-semibold",
									(!badge.variant || badge.variant === "default") &&
										"bg-primary/10 text-primary",
								)}
							>
								{badge.label}
							</span>
						))}
					</div>
				) : null}

				{/* Title and description */}
				<div className="space-y-2 flex-1">
					{typeof title === "string" ? (
						<h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
							{title}
						</h3>
					) : (
						title
					)}
					{subtitle ? (
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
							{subtitle}
						</p>
					) : null}
					{description ? (
						<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
							{description}
						</p>
					) : null}
				</div>

				{/* Meta info */}
				{meta && meta.length > 0 ? (
					<ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-3">
						{meta.map((item) => (
							<li
								key={item.label}
								className="flex items-center gap-1.5 font-medium"
							>
								<span className="text-primary/70">{item.icon}</span>
								<span>{item.label}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>

			{/* Footer */}
			{footer ? <div className="px-5 pb-5 pt-0">{footer}</div> : null}

			{/* Decorative gradient on hover */}
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
		</article>
	);
}

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
				"card-surface flex h-full flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1",
				className,
			)}
		>
			{cover ? <div className="relative overflow-hidden">{cover}</div> : null}
			<div className="flex flex-1 flex-col gap-4 p-6">
				{badges && badges.length > 0 ? (
					<div className="flex flex-wrap items-center gap-2 text-xs">
						{badges.map((badge, index) => (
							<span
								key={`${badge.label}-${index}`}
								className={cn(
									"inline-flex items-center rounded-full px-3 py-1 font-medium",
									badge.variant === "secondary" &&
										"bg-muted text-muted-foreground",
									badge.variant === "outline" &&
										"border border-border/70 bg-transparent",
									badge.variant === "destructive" &&
										"bg-destructive/10 text-destructive",
									(!badge.variant || badge.variant === "default") &&
										"bg-primary/10 text-primary",
								)}
							>
								{badge.label}
							</span>
						))}
					</div>
				) : null}
				<div className="space-y-2">
					{typeof title === "string" ? (
						<h3 className="line-clamp-2 text-xl font-semibold text-foreground">
							{title}
						</h3>
					) : (
						title
					)}
					{subtitle ? (
						<p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							{subtitle}
						</p>
					) : null}
					{description ? (
						<p className="line-clamp-3 text-sm text-muted-foreground">
							{description}
						</p>
					) : null}
				</div>
				{meta && meta.length > 0 ? (
					<ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
						{meta.map((item) => (
							<li
								key={item.label}
								className="flex items-center gap-1.5 font-medium"
							>
								{item.icon}
								<span>{item.label}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>
			{footer ? <div className="px-6 pb-6">{footer}</div> : null}
		</article>
	);
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatBadgeProps = {
	label: string;
	value: string;
	icon?: ReactNode;
	className?: string;
};

export function StatBadge({ label, value, icon, className }: StatBadgeProps) {
	return (
		<div
			className={cn(
				"card-surface flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur motion-safe:animate-scale-in",
				className,
			)}
		>
			{icon ? <span className="text-primary">{icon}</span> : null}
			<div className="flex flex-col">
				<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</span>
				<span className="text-lg font-semibold text-foreground">{value}</span>
			</div>
		</div>
	);
}

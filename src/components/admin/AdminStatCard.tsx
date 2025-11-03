import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
	label: string;
	value: ReactNode;
	icon?: ReactNode;
	delta?: ReactNode;
	description?: string;
	className?: string;
};

export function AdminStatCard({
	label,
	value,
	icon,
	delta,
	description,
	className,
}: AdminStatCardProps) {
	return (
		<div
			className={cn(
				"card-surface flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
				{icon ? <span className="text-primary">{icon}</span> : null}
			</div>
			<div className="flex items-baseline gap-3">
				<span className="text-3xl font-semibold text-foreground">{value}</span>
				{delta ? (
					<span className="text-xs font-medium text-muted-foreground">
						{delta}
					</span>
				) : null}
			</div>
			{description ? (
				<p className="text-xs text-muted-foreground">{description}</p>
			) : null}
		</div>
	);
}

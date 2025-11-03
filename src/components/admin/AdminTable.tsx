import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminTableProps = {
	children: ReactNode;
	title: string;
	description?: string;
	badge?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

export function AdminTable({
	children,
	title,
	description,
	badge,
	actions,
	className,
}: AdminTableProps) {
	return (
		<div
			className={cn(
				"card-surface overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-lg",
				className,
			)}
		>
			<div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-background/60 px-6 py-5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">{title}</h2>
						{badge}
					</div>
					{description ? (
						<p className="text-sm text-muted-foreground">{description}</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</div>
			{children}
		</div>
	);
}

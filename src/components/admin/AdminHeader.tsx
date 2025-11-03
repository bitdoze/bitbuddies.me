import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderStat = {
	label: string;
	value: ReactNode;
	sublabel?: string;
	icon?: ReactNode;
	trend?: ReactNode;
};

type AdminHeaderProps = {
	className?: string;
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	stats?: HeaderStat[];
};

export function AdminHeader({
	className,
	eyebrow,
	title,
	description,
	actions,
	stats,
}: AdminHeaderProps) {
	return (
		<section
			className={cn(
				"relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5",
				className,
			)}
		>
			<div
				className="pointer-events-none absolute inset-y-0 right-0 w-1/2 translate-x-1/4 bg-primary/10 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute -bottom-10 left-1/4 h-40 w-40 rounded-full bg-secondary/20 blur-2xl"
				aria-hidden="true"
			/>
			<div className="relative z-10 flex flex-col gap-10 p-8 md:p-12">
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div className="space-y-4">
						{eyebrow ? (
							<span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{eyebrow}
							</span>
						) : null}
						<h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
							{title}
						</h1>
						{description ? (
							<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
								{description}
							</p>
						) : null}
					</div>
					{actions ? (
						<div className="flex flex-wrap items-center gap-3">{actions}</div>
					) : null}
				</div>
				{stats && stats.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="card-surface flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur"
							>
								<div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
									<span>{stat.label}</span>
									{stat.trend ? (
										<span className="text-foreground/70">{stat.trend}</span>
									) : null}
								</div>
								<div className="flex items-baseline gap-3">
									<span className="text-2xl font-semibold text-foreground">
										{stat.value}
									</span>
									{stat.icon ? (
										<span className="text-primary">{stat.icon}</span>
									) : null}
								</div>
								{stat.sublabel ? (
									<p className="text-xs text-muted-foreground">
										{stat.sublabel}
									</p>
								) : null}
							</div>
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}

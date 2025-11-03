import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SectionHeaderProps = {
	eyebrow?: string;
	title: string;
	description?: string;
	className?: string;
	align?: "left" | "center";
	icon?: React.ReactNode;
};

export function SectionHeader({
	eyebrow,
	title,
	description,
	className,
	align = "left",
	icon,
}: SectionHeaderProps) {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 motion-safe:animate-fade-up",
				align === "center" && "items-center text-center",
				align === "left" && "items-start",
				className,
			)}
		>
			{/* Eyebrow badge */}
			{eyebrow ? (
				<Badge
					variant="outline"
					className="inline-flex items-center gap-2 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary"
				>
					{icon && <span className="shrink-0">{icon}</span>}
					{eyebrow}
				</Badge>
			) : null}

			{/* Title */}
			<h2
				className={cn(
					"text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl",
					align === "center" && "max-w-3xl",
					align === "left" && "max-w-2xl",
				)}
			>
				{title}
			</h2>

			{/* Description */}
			{description ? (
				<p
					className={cn(
						"text-base leading-relaxed text-muted-foreground sm:text-lg",
						align === "center" && "max-w-2xl text-center",
						align === "left" && "max-w-xl",
					)}
				>
					{description}
				</p>
			) : null}
		</header>
	);
}

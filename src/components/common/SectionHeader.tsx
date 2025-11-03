import { cn } from "@/lib/utils";

type SectionHeaderProps = {
	eyebrow?: string;
	title: string;
	description?: string;
	className?: string;
	align?: "left" | "center";
};

export function SectionHeader({
	eyebrow,
	title,
	description,
	className,
	align = "left",
}: SectionHeaderProps) {
	return (
		<header
			className={cn(
				"section-heading motion-safe:animate-fade-up",
				align === "center" && "items-center text-center",
				className,
			)}
		>
			{eyebrow ? (
				<span className="section-heading__eyebrow">{eyebrow}</span>
			) : null}
			<h2 className="section-heading__title">{title}</h2>
			{description ? (
				<p
					className={cn(
						"section-heading__description",
						align === "center" && "md:text-center",
					)}
				>
					{description}
				</p>
			) : null}
		</header>
	);
}

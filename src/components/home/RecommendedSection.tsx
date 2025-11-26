import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActiveRecommendedSectionsWithItems } from "@/hooks/useRecommendedItems";

export type RecommendedItem = {
	id: string;
	title: string;
	description: string;
	category: string;
	badge?: string;
	badgeColor?: "red" | "blue" | "green" | "purple";
	imageUrl: string;
	ctaText: string;
	ctaUrl: string;
	isAffiliate?: boolean;
};

export type RecommendedSectionProps = {
	title: string;
	items: RecommendedItem[];
	className?: string;
};

const badgeColors = {
	red: "bg-red-500 text-white",
	blue: "bg-blue-500 text-white",
	green: "bg-emerald-500 text-white",
	purple: "bg-purple-500 text-white",
};

export function RecommendedSection({
	title,
	items,
	className,
}: RecommendedSectionProps) {
	return (
		<section className={cn("py-12", className)}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
				<div className="mt-2 h-1 w-16 rounded-full bg-primary" />
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<RecommendedCard key={item.id} item={item} />
				))}
			</div>
		</section>
	);
}

type SectionWithItems = {
	_id: string;
	title: string;
	items: Array<{
		_id: string;
		title: string;
		description: string;
		category: string;
		badge?: string;
		badgeColor?: "red" | "blue" | "green" | "purple";
		imageUrl: string;
		ctaText: string;
		ctaUrl: string;
		isAffiliate: boolean;
	}>;
};

export function RecommendedSections({ className }: { className?: string }) {
	const sectionsWithItems = useActiveRecommendedSectionsWithItems() as SectionWithItems[] | undefined;

	if (!sectionsWithItems || sectionsWithItems.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-8", className)}>
			{sectionsWithItems.map((section) => (
				<RecommendedSection
					key={section._id}
					title={section.title}
					items={section.items.map((item) => ({
						id: item._id,
						title: item.title,
						description: item.description,
						category: item.category,
						badge: item.badge,
						badgeColor: item.badgeColor,
						imageUrl: item.imageUrl,
						ctaText: item.ctaText,
						ctaUrl: item.ctaUrl,
						isAffiliate: item.isAffiliate,
					}))}
				/>
			))}
		</div>
	);
}

function RecommendedCard({ item }: { item: RecommendedItem }) {
	return (
		<article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
			{item.badge && (
				<div className="absolute right-3 top-3 z-10">
					<span
						className={cn(
							"inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-md",
							badgeColors[item.badgeColor ?? "red"]
						)}
					>
						{item.badge}
					</span>
				</div>
			)}

			<div className="flex h-40 items-center justify-center bg-muted/50 p-6">
				<img
					src={item.imageUrl}
					alt={item.title}
					className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
				/>
			</div>

			<div className="flex flex-1 flex-col p-5">
				<Badge variant="outline" className="mb-3 w-fit text-xs">
					{item.category}
				</Badge>

				<h3 className="mb-2 font-bold leading-snug line-clamp-2">
					{item.title}
				</h3>

				<p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
					{item.description}
				</p>

				<Button
					asChild
					className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<a
						href={item.ctaUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						{item.ctaText}
						<ArrowRight className="ml-2 h-4 w-4" />
					</a>
				</Button>

				{item.isAffiliate && (
					<p className="mt-2 text-center text-xs text-muted-foreground">
						*Affiliate link
					</p>
				)}
			</div>
		</article>
	);
}

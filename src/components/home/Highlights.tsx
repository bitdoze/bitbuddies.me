import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Calendar, FileText } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ContentCard } from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";

export type HighlightItem = {
	id: string;
	link?: ReactNode;
	card?: ReactNode;
};

export type HighlightSection = {
	id: string;
	eyebrow?: string;
	title: string;
	description?: string;
	items: HighlightItem[];
	viewAllLink?: string;
	viewAllText?: string;
	icon?: ReactNode;
};

type HighlightsProps = {
	sections: HighlightSection[];
};

export function Highlights({ sections }: HighlightsProps) {
	// Map section IDs to icons
	const sectionIcons: Record<string, ReactNode> = {
		courses: <BookOpen className="h-4 w-4" />,
		workshops: <Calendar className="h-4 w-4" />,
		posts: <FileText className="h-4 w-4" />,
	};

	return (
		<div id="highlights" className="space-y-24">
			{sections.map((section, sectionIndex) => (
				<section
					key={section.id}
					className="relative"
				>
					{/* Background decoration for alternating sections */}
					{sectionIndex % 2 === 1 && (
						<div className="absolute inset-0 -z-10 overflow-hidden">
							<div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
						</div>
					)}

					<div className="container space-y-10">
						{/* Section header with optional view all button */}
						<div className="flex items-end justify-between gap-6">
							<div className="flex-1">
								<SectionHeader
									eyebrow={section.eyebrow}
									title={section.title}
									description={section.description}
									icon={section.icon || sectionIcons[section.id]}
								/>
							</div>
							{section.viewAllLink && (
								<Button
									variant="outline"
									asChild
									className="group gap-2 motion-safe:animate-fade-up"
								>
									<a href={section.viewAllLink}>
										{section.viewAllText || "View all"}
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</a>
								</Button>
							)}
						</div>

						{/* Items grid with staggered animation */}
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{section.items.map((item, index) => (
								<div
									key={item.id}
									className="group motion-safe:animate-fade-up"
									style={{
										animationDelay: `${index * 100}ms`,
										animationFillMode: "backwards",
									}}
								>
									{item.link ?? item.card}
								</div>
							))}
						</div>

						{/* Empty state for sections with no items */}
						{section.items.length === 0 && (
							<div className="rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 p-16 text-center">
								<div className="mx-auto max-w-md space-y-4">
									<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
										<span className="text-3xl">📚</span>
									</div>
									<h3 className="text-xl font-semibold text-foreground">
										Coming Soon
									</h3>
									<p className="text-sm text-muted-foreground">
										We're working on amazing content for this section. Check back soon!
									</p>
								</div>
							</div>
						)}
					</div>
				</section>
			))}
		</div>
	);
}

export function buildContentCard(cardProps: Parameters<typeof ContentCard>[0]) {
	return <ContentCard {...cardProps} />;
}

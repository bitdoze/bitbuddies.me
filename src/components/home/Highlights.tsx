import type { ReactNode } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ContentCard } from "@/components/content/ContentCard";

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
};

type HighlightsProps = {
	sections: HighlightSection[];
};

export function Highlights({ sections }: HighlightsProps) {
	return (
		<div id="highlights" className="space-y-20">
			{sections.map((section) => (
				<section key={section.id} className="section-spacing">
					<div className="container space-y-12">
						<SectionHeader
							eyebrow={section.eyebrow}
							title={section.title}
							description={section.description}
						/>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{section.items.map((item) => (
								<div key={item.id} className="motion-safe:animate-fade-up">
									{item.link ?? item.card}
								</div>
							))}
						</div>
					</div>
				</section>
			))}
		</div>
	);
}

export function buildContentCard(cardProps: Parameters<typeof ContentCard>[0]) {
	return <ContentCard {...cardProps} />;
}

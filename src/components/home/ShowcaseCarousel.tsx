import type { ReactNode } from "react";

export type ShowcaseItem = {
	id: string;
	title: string;
	description: string;
	cta: ReactNode;
	footer?: ReactNode;
};

type ShowcaseCarouselProps = {
	title: string;
	subtitle?: string;
	items: ShowcaseItem[];
};

export function ShowcaseCarousel({
	title,
	subtitle,
	items,
}: ShowcaseCarouselProps) {
	if (items.length === 0) return null;

	return (
		<section className="section-spacing">
			<div className="container space-y-8">
				<div className="section-heading motion-safe:animate-fade-up">
					<h2 className="section-heading__title">{title}</h2>
					{subtitle ? (
						<p className="section-heading__description max-w-3xl">{subtitle}</p>
					) : null}
				</div>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
					<div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
					<div className="flex snap-x gap-6 overflow-x-auto pb-4">
						{items.map((item, index) => (
							<div
								key={item.id}
								className="card-surface min-w-[280px] max-w-xs flex-1 snap-center bg-card/90 p-6 motion-safe:animate-fade-up"
								style={{ animationDelay: `${index * 0.05}s` }}
							>
								<h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
								<p className="text-sm text-muted-foreground">
									{item.description}
								</p>
								<div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-primary">
									{item.cta}
								</div>
								{item.footer ? (
									<div className="mt-4 text-xs text-muted-foreground">
										{item.footer}
									</div>
								) : null}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

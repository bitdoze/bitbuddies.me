import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type CommunityBannerProps = {
	primaryHref?: string;
	secondaryHref?: string;
	sectionId?: string;
};

export function CommunityBanner({
	primaryHref = "/workshops",
	secondaryHref = "/community",
	sectionId,
}: CommunityBannerProps) {
	return (
		<section id={sectionId} className="section-spacing">
			<div className="container">
				<div className="card-surface flex flex-col gap-8 overflow-hidden bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 p-10 text-center md:flex-row md:items-center md:justify-between md:text-left">
					<div className="space-y-3 motion-safe:animate-fade-up">
						<span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
							<Users className="h-4 w-4" />
							Join 8k+ developers
						</span>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Level up together in the BitBuddies community
						</h2>
						<p className="text-base text-muted-foreground md:max-w-xl">
							Share progress, attend live reviews, and get feedback from mentors
							who have shipped products across startups and scale-ups.
						</p>
					</div>
					<div className="flex flex-col items-center gap-4 motion-safe:animate-fade-up md:flex-row">
						<Button asChild size="lg" className="gap-2">
							<a href={primaryHref}>
								Explore workshops
								<ArrowRight className="h-4 w-4" />
							</a>
						</Button>
						<Button asChild size="lg" variant="outline">
							<a href={secondaryHref}>Meet the community</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { Gift, Layers } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { RecommendedSections } from "@/components/home/RecommendedSection";

export const Route = createFileRoute("/recommended" as any)({
	component: RecommendedPage,
});

function RecommendedPage() {
	return (
		<>
			<SEO
				title="Recommended Tools & Resources"
				description="Curated collection of AI tools, development resources, and products we recommend for developers and creators."
				keywords="recommended, tools, resources, AI, development"
			/>
			<main className="flex flex-col">
				{/* Hero Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
					<div className="container">
						<SectionHeader
							align="center"
							eyebrow="Curated for You"
							title="Recommended Tools & Resources"
							description="Hand-picked tools, products, and resources that we use and recommend for developers, creators, and indie hackers."
							icon={<Gift className="h-5 w-5" />}
						/>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Recommended Sections */}
				<section className="py-12 md:py-16">
					<div className="container">
						<RecommendedSections />

						{/* Empty state */}
						<EmptyState />
					</div>
				</section>
			</main>
		</>
	);
}

function EmptyState() {
	return (
		<div className="hidden only:flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-4 rounded-full bg-muted p-6">
				<Layers className="h-12 w-12 text-muted-foreground" />
			</div>
			<h2 className="mb-2 text-xl font-semibold">No recommendations yet</h2>
			<p className="text-muted-foreground max-w-md">
				We're curating the best tools and resources for you. Check back soon!
			</p>
		</div>
	);
}

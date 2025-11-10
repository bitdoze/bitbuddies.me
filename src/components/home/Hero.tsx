import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { Button } from "@/components/ui/button";

type HeroProps = {
	onPrimaryCta?: () => void;
	onSecondaryCta?: () => void;
	primaryHref?: string;
	secondaryHref?: string;
};

const transitionVariants = {
	container: {
		visible: {
			transition: {
				delayChildren: 0.2,
				staggerChildren: 0.08,
			},
		},
	},
};

export function Hero({
	onPrimaryCta,
	onSecondaryCta,
	primaryHref = "#highlights",
	secondaryHref = "#community",
}: HeroProps) {
	return (
		<section className="relative overflow-hidden">
			<div
				aria-hidden
				className="absolute inset-0 -z-10 isolate hidden opacity-60 lg:block"
			>
				<div className="absolute left-0 top-0 h-[320px] w-[560px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
				<div className="absolute left-0 top-0 h-[320px] w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] translate-x-[5%] -translate-y-1/2" />
				<div className="absolute left-16 top-10 h-[320px] w-[320px] -rotate-45 rounded-full bg-[radial-gradient(60%_60%_at_40%_30%,hsla(0,0%,85%,.05)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
			</div>
			<div
				aria-hidden
				className="absolute inset-0 -z-20 bg-[radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
			/>
			<div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 text-center md:pt-32 md:pb-24">
				<AnimatedGroup variants={transitionVariants}>
					<Link
						to="/workshops"
						className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-border/50 bg-muted/60 p-1 pl-4 text-sm shadow-md shadow-black/5 transition-colors duration-300 hover:bg-background"
					>
						<span className="text-foreground">
							✨ New workshops launching every month
						</span>
						<span
							className="block h-4 w-0.5 rounded-full bg-border/60"
							aria-hidden
						/>
						<span className="bg-background group-hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors duration-300">
							<ArrowRight className="size-3" />
						</span>
					</Link>
				</AnimatedGroup>

				<TextEffect
					preset="fade-in-blur"
					speedSegment={0.4}
			as="h1"
			className="mx-auto mt-8 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:mt-12"
		>
			Ship modern web apps without the all-nighter hangover
		</TextEffect>

		<TextEffect
			per="line"
			preset="fade-in-blur"
					speedSegment={0.4}
			delay={0.4}
			as="p"
			className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground"
		>
			Join a crew of builders who binge React, Convex, and AI tooling for fun. We run
			playful courses, chaotic live workshops, and ship-ready projects so you can build
			something impressive before your coffee gets cold.
		</TextEffect>

				<AnimatedGroup
					variants={{
						container: {
							visible: {
								transition: { staggerChildren: 0.05, delayChildren: 0.6 },
							},
						},
					}}
					className="mt-10 flex flex-col items-center gap-3 md:flex-row md:justify-center"
				>
					<div className="rounded-[calc(var(--radius-xl)+0.125rem)] border border-border/80 bg-foreground/10 p-0.5">
						<Button
							asChild
							size="lg"
							className="rounded-xl px-5 text-base"
							onClick={onPrimaryCta}
						>
							<a href={primaryHref}>
								Explore courses
								<ArrowRight className="ml-2 h-4 w-4" />
							</a>
						</Button>
					</div>
					<Button
						asChild
						size="lg"
						variant="ghost"
						className="rounded-xl px-5 text-base"
						onClick={onSecondaryCta}
					>
						<a href={secondaryHref}>Watch tutorials</a>
					</Button>
				</AnimatedGroup>
			</div>
		</section>
	);
}

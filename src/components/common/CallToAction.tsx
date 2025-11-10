import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAButton = {
	label: string;
	href: string;
	icon?: ReactNode;
	variant?: "default" | "outline" | "ghost";
};

type CallToActionProps = {
	badge?: string;
	badgeIcon?: ReactNode;
	title: string;
	description: string;
	primaryButton: CTAButton;
	secondaryButton?: CTAButton;
	className?: string;
};

export function CallToAction({
	badge = "Start Your Journey Today",
	badgeIcon,
	title,
	description,
	primaryButton,
	secondaryButton,
	className,
}: CallToActionProps) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-background/50 to-sky-500/10 p-8 shadow-2xl backdrop-blur-sm md:p-12",
				className
			)}
		>
			<div className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/20">
					{badgeIcon || <Sparkles className="h-4 w-4" />}
					<span>{badge}</span>
				</div>

				{/* Title */}
				<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					{title}
				</h2>

				{/* Description */}
				<p className="text-lg text-muted-foreground/90 leading-relaxed">
					{description}
				</p>

				{/* Buttons */}
				<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
					<Button
						size="lg"
						asChild
						className="gap-2 shadow-lg"
						variant={primaryButton.variant}
					>
						<Link to={primaryButton.href}>
							{primaryButton.icon}
							{primaryButton.label}
						</Link>
					</Button>
					{secondaryButton && (
						<Button
							size="lg"
							variant={secondaryButton.variant || "outline"}
							asChild
							className="gap-2"
						>
							<Link to={secondaryButton.href}>
								{secondaryButton.icon}
								{secondaryButton.label}
							</Link>
						</Button>
					)}
				</div>
			</div>

			{/* Decorative gradients */}
			<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
			<div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
		</div>
	);
}

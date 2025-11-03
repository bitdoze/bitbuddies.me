import type React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeConfig {
	label: string;
	variant?: "default" | "secondary" | "outline" | "destructive";
}

interface BackLinkConfig {
	to: string;
	label: string;
}

interface ContentDetailHeaderProps {
	title: string;
	description?: string;
	badges?: BadgeConfig[];
	backLink: BackLinkConfig;
	meta?: React.ReactNode;
	className?: string;
}

/**
 * ContentDetailHeader - Reusable header for content detail pages
 *
 * Features:
 * - Back button with arrow icon
 * - Flexible badge system
 * - Large, readable title
 * - Optional description
 * - Meta information slot
 *
 * Usage:
 * <ContentDetailHeader
 *   title="Workshop Title"
 *   description="Short description"
 *   badges={[{ label: "Beginner", variant: "secondary" }]}
 *   backLink={{ to: "/workshops", label: "Back to Workshops" }}
 * />
 */
export function ContentDetailHeader({
	title,
	description,
	badges = [],
	backLink,
	meta,
	className,
}: ContentDetailHeaderProps) {
	return (
		<header className={cn("space-y-6", className)}>
			{/* Back Button */}
			<Button variant="ghost" size="sm" asChild>
				<Link to={backLink.to}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{backLink.label}
				</Link>
			</Button>

			{/* Badges */}
			{badges.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					{badges.map((badge, index) => (
						<Badge
							key={`${badge.label}-${index}`}
							variant={badge.variant || "default"}
						>
							{badge.label}
						</Badge>
					))}
				</div>
			)}

			{/* Title */}
			<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
				{title}
			</h1>

			{/* Description */}
			{description && (
				<p className="text-xl text-muted-foreground leading-relaxed">
					{description}
				</p>
			)}

			{/* Meta Slot */}
			{meta && <div className="pt-2">{meta}</div>}
		</header>
	);
}

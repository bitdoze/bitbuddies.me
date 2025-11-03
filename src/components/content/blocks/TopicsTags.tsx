import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TopicsTagsProps {
	tags: string[];
	title?: string;
	variant?: "default" | "card" | "inline";
	className?: string;
}

/**
 * TopicsTags - Display tags/topics consistently
 *
 * Features:
 * - Flexible display styles (default, card, inline)
 * - Responsive wrapping
 * - Consistent spacing
 * - Optional title/heading
 *
 * Usage:
 * <TopicsTags
 *   tags={workshop.tags}
 *   title="Topics"
 *   variant="card"
 * />
 */
export function TopicsTags({
	tags,
	title = "Topics",
	variant = "default",
	className,
}: TopicsTagsProps) {
	if (!tags || tags.length === 0) {
		return null;
	}

	const tagsContent = (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag, index) => (
				<Badge key={`${tag}-${index}`} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	if (variant === "card") {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="text-lg">{title}</CardTitle>
				</CardHeader>
				<CardContent>{tagsContent}</CardContent>
			</Card>
		);
	}

	if (variant === "inline") {
		return (
			<div className={cn("flex items-center gap-3", className)}>
				{title && (
					<span className="text-sm font-medium text-muted-foreground">
						{title}:
					</span>
				)}
				{tagsContent}
			</div>
		);
	}

	// Default variant
	return (
		<div className={cn("space-y-3", className)}>
			{title && <h3 className="text-sm font-semibold uppercase">{title}</h3>}
			{tagsContent}
		</div>
	);
}

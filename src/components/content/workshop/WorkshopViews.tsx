
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorkshopViewsProps {
	viewCount: number;
	variant?: "default" | "compact" | "inline";
	showIcon?: boolean;
	className?: string;
}

/**
 * WorkshopViews - View counter for workshops
 *
 * Features:
 * - Displays view count with icon
 * - Multiple display variants
 * - Formatted numbers (1.2k, 1M, etc.)
 * - Responsive layout
 *
 * Usage:
 * <WorkshopViews
 *   viewCount={1234}
 *   variant="default"
 * />
 */
export function WorkshopViews({
	viewCount,
	variant = "default",
	showIcon = true,
	className,
}: WorkshopViewsProps) {
	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}k`;
		}
		return num.toString();
	};

	// Inline variant - small, minimal
	if (variant === "inline") {
		return (
			<div
				className={cn(
					"flex items-center gap-1.5 text-sm text-muted-foreground",
					className,
				)}
			>
				{showIcon && <Eye className="h-4 w-4" />}
				<span>{formatNumber(viewCount)} views</span>
			</div>
		);
	}

	// Compact variant - badge-like
	if (variant === "compact") {
		return (
			<div
				className={cn(
					"inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm",
					className,
				)}
			>
				{showIcon && <Eye className="h-4 w-4 text-muted-foreground" />}
				<span className="font-medium">
					{formatNumber(viewCount)} views
				</span>
			</div>
		);
	}

	// Default variant - card
	return (
		<Card className={className}>
			<CardContent className="p-4">
				<div className="flex items-center gap-3">
					{showIcon && (
						<div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
							<Eye className="h-5 w-5 text-primary" />
						</div>
					)}
					<div className="flex-1">
						<dt className="text-xs text-muted-foreground mb-0.5">
							Total Views
						</dt>
						<dd className="text-2xl font-bold">{formatNumber(viewCount)}</dd>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

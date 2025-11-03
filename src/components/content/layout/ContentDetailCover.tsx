import type React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentDetailCoverProps {
	imageUrl?: string;
	alt: string;
	aspectRatio?: "video" | "square" | "wide";
	fallbackIcon?: React.ReactNode;
	className?: string;
}

/**
 * ContentDetailCover - Properly sized cover image container
 *
 * Features:
 * - Contained within max-w-4xl (no more full-width oversized images)
 * - Proper aspect ratio classes (no inline style hacks)
 * - Rounded corners with border and shadow
 * - Graceful fallback for missing images
 *
 * Usage:
 * <ContentDetailCover
 *   imageUrl={content.coverAsset?.url}
 *   alt={content.title}
 * />
 */
export function ContentDetailCover({
	imageUrl,
	alt,
	aspectRatio = "video",
	fallbackIcon,
	className,
}: ContentDetailCoverProps) {
	const aspectRatioClass = {
		video: "aspect-video",
		square: "aspect-square",
		wide: "aspect-[21/9]",
	}[aspectRatio];

	return (
		<div
			className={cn(
				"w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border shadow-lg",
				aspectRatioClass,
				className,
			)}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={alt}
					className="w-full h-full object-cover"
					loading="lazy"
				/>
			) : (
				<div className="w-full h-full bg-muted flex items-center justify-center">
					{fallbackIcon || (
						<ImageIcon className="h-24 w-24 text-muted-foreground" />
					)}
				</div>
			)}
		</div>
	);
}

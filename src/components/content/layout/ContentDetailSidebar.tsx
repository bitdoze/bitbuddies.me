import type React from "react";
import { cn } from "@/lib/utils";

interface ContentDetailSidebarProps {
	children: React.ReactNode;
	sticky?: boolean;
	className?: string;
}

/**
 * ContentDetailSidebar - Container for meta information cards
 *
 * Features:
 * - Sticky positioning on desktop (optional)
 * - Responsive (full width mobile, 400px desktop)
 * - Consistent spacing between cards
 * - Proper top offset for sticky positioning
 *
 * Usage:
 * <ContentDetailSidebar>
 *   <MetaInfoCard {...} />
 *   <TopicsTags {...} />
 * </ContentDetailSidebar>
 *
 * Note: This component is typically used as the sidebar prop in ContentDetailLayout
 */
export function ContentDetailSidebar({
	children,
	sticky = true,
	className,
}: ContentDetailSidebarProps) {
	return (
		<div
			className={cn(
				"space-y-6",
				sticky && "lg:sticky lg:top-24 lg:self-start",
				className,
			)}
		>
			{children}
		</div>
	);
}

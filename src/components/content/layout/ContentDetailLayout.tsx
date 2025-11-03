import type React from "react";
import { cn } from "@/lib/utils";

interface ContentDetailLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
	maxWidth?: "4xl" | "5xl" | "7xl";
	className?: string;
}

/**
 * ContentDetailLayout - Main layout wrapper for content detail pages
 *
 * Features:
 * - Responsive grid layout (single column mobile, sidebar on desktop)
 * - Sticky sidebar on scroll
 * - Consistent max-width containers
 * - Proper spacing with section-spacing
 *
 * Usage:
 * <ContentDetailLayout sidebar={<Sidebar />}>
 *   <Header />
 *   <Cover />
 *   <Content />
 * </ContentDetailLayout>
 */
export function ContentDetailLayout({
	children,
	sidebar,
	maxWidth = "7xl",
	className,
}: ContentDetailLayoutProps) {
	const maxWidthClass = {
		"4xl": "max-w-4xl",
		"5xl": "max-w-5xl",
		"7xl": "max-w-7xl",
	}[maxWidth];

	return (
		<div className={cn("section-spacing", className)}>
			<div className={cn("container", maxWidthClass)}>
				{sidebar ? (
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
						<div className="space-y-12 lg:space-y-16">{children}</div>
						<aside className="order-first lg:order-last">
							<div className="lg:sticky lg:top-24 space-y-6">{sidebar}</div>
						</aside>
					</div>
				) : (
					<div className="space-y-12 lg:space-y-16">{children}</div>
				)}
			</div>
		</div>
	);
}

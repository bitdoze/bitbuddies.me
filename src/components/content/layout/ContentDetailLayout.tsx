"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Menu, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContentDetailLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
	maxWidth?: "4xl" | "5xl" | "7xl";
	className?: string;
	sidebarTitle?: string;
}

/**
 * ContentDetailLayout - Main layout wrapper for content detail pages
 *
 * Features:
 * - Responsive grid layout (single column mobile, sidebar on desktop)
 * - Mobile: Collapsible sidebar with toggle button
 * - Desktop: Sticky sidebar on scroll
 * - Consistent max-width containers
 * - Proper spacing with section-spacing
 *
 * Mobile behavior:
 * - Content appears first
 * - Sidebar is collapsed by default
 * - Toggle button to show/hide sidebar
 * - Smooth animations
 *
 * Desktop behavior:
 * - Two-column layout
 * - Sticky sidebar on right
 * - Always visible
 *
 * Usage:
 * <ContentDetailLayout sidebar={<Sidebar />} sidebarTitle="Course Details">
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
	sidebarTitle = "Details",
}: ContentDetailLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showFloatingButton, setShowFloatingButton] = useState(true);

	const maxWidthClass = {
		"4xl": "max-w-4xl",
		"5xl": "max-w-5xl",
		"7xl": "max-w-7xl",
	}[maxWidth];

	// Hide floating button when sidebar is in view on mobile
	useEffect(() => {
		if (typeof window === "undefined" || !sidebar) return;

		const handleScroll = () => {
			// Only apply on mobile screens
			if (window.innerWidth >= 1024) {
				setShowFloatingButton(false);
				return;
			}

			const scrollPosition = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// Hide button when near bottom of page (where sidebar would be)
			const nearBottom = scrollPosition + windowHeight > documentHeight - 500;
			setShowFloatingButton(!nearBottom && !isSidebarOpen);
		};

		handleScroll(); // Initial check
		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, [sidebar, isSidebarOpen]);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);

		// Scroll to top of sidebar when opening on mobile
		if (!isSidebarOpen) {
			setTimeout(() => {
				const sidebarElement = document.getElementById("mobile-sidebar");
				if (sidebarElement) {
					sidebarElement.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100);
		}
	};

	return (
		<div className={cn("section-spacing", className)}>
			<div className={cn("container", maxWidthClass)}>
				{sidebar ? (
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
						{/* Main content */}
						<div className="space-y-12 lg:space-y-16 order-1">{children}</div>

						{/* Sidebar - Desktop: always visible, Mobile: collapsible */}
						<aside className="order-2" id="mobile-sidebar">
							{/* Mobile: Collapsible sidebar with toggle button */}
							<div className="lg:hidden">
								{/* Toggle button for mobile */}
								<Button
									variant="outline"
									size="lg"
									onClick={toggleSidebar}
									className={cn(
										"w-full justify-between text-base font-semibold mb-4 transition-all",
										isSidebarOpen && "bg-primary text-primary-foreground hover:bg-primary/90"
									)}
								>
									<span className="flex items-center gap-2">
										<Menu className="h-5 w-5" />
										{sidebarTitle}
									</span>
									{isSidebarOpen ? (
										<ChevronUp className="h-5 w-5" />
									) : (
										<ChevronDown className="h-5 w-5" />
									)}
								</Button>

								{/* Collapsible sidebar content */}
								<div
									className={cn(
										"overflow-hidden transition-all duration-300 ease-in-out",
										isSidebarOpen
											? "max-h-[2000px] opacity-100"
											: "max-h-0 opacity-0",
									)}
								>
									<div className="space-y-6 pb-6">{sidebar}</div>

									{/* Close button at bottom */}
									{isSidebarOpen && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => setIsSidebarOpen(false)}
											className="w-full mt-4"
										>
											<X className="h-4 w-4 mr-2" />
											Close {sidebarTitle}
										</Button>
									)}
								</div>
							</div>

							{/* Desktop: Sticky sidebar */}
							<div className="hidden lg:block">
								<div className="lg:sticky lg:top-24 space-y-6">{sidebar}</div>
							</div>
						</aside>
					</div>
				) : (
					<div className="space-y-12 lg:space-y-16">{children}</div>
				)}

				{/* Floating Action Button for mobile sidebar access */}
				{sidebar && (
					<div className="lg:hidden">
						<Button
							onClick={toggleSidebar}
							size="lg"
							className={cn(
								"fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300",
								"h-14 w-14 rounded-full p-0",
								"bg-primary hover:bg-primary/90 text-primary-foreground",
								"animate-pulse-scale",
								showFloatingButton && !isSidebarOpen
									? "translate-y-0 opacity-100 scale-100"
									: "translate-y-20 opacity-0 scale-0 pointer-events-none"
							)}
							aria-label={`Toggle ${sidebarTitle}`}
						>
							<Info className="h-6 w-6" />
						</Button>

						{/* Backdrop overlay when sidebar is open on mobile */}
						{isSidebarOpen && (
							<div
								className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
								onClick={() => setIsSidebarOpen(false)}
								aria-hidden="true"
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../components/common/theme-provider";
import { UserSyncProvider } from "../components/common/UserSyncProvider";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { AppSidebar } from "../components/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "BitBuddies - Learn, Build, Connect",
			},
			{
				name: "description",
				content: "Empowering developers to build amazing things together",
			},
			{
				name: "theme-color",
				content: "#6366f1",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			// Favicons - comprehensive setup for all devices
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "32x32",
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
		],
		scripts: [
			{
				src: "https://an.bitdoze.com/js/script.js",
				defer: true,
				"data-domain": "bitbuddies.me",
			},
		],
	}),

	notFoundComponent: () => (
		<div className="container mx-auto py-8">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold">404 - Page Not Found</h1>
				<p className="text-muted-foreground">
					The page you're looking for doesn't exist.
				</p>
			</div>
		</div>
	),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<HelmetProvider>
					<ThemeProvider defaultTheme="system" storageKey="bitbuddies-ui-theme">
						<ClerkProvider>
							<ConvexProvider>
								<UserSyncProvider>
									<SidebarProvider>
										<AppSidebar />
										<SidebarInset className="flex flex-col min-h-screen">
											<Header />
											<main className="flex-1 w-full">{children}</main>
											<Footer />
										</SidebarInset>
									</SidebarProvider>
									<TanStackDevtools
										config={{
											position: "bottom-right",
										}}
										plugins={[
											{
												name: "Tanstack Router",
												render: <TanStackRouterDevtoolsPanel />,
											},
										]}
									/>
								</UserSyncProvider>
							</ConvexProvider>
						</ClerkProvider>
					</ThemeProvider>
				</HelmetProvider>
				<Scripts />
			</body>
		</html>
	);
}

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../components/common/theme-provider";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { AppSidebar } from "../components/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import { UserSyncProvider } from "../components/common/UserSyncProvider";

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
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.ico",
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

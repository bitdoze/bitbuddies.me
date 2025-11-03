import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin" as any)({
	component: AdminLayout,
});

function AdminLayout() {
	const { isAdmin, isLoading: authLoading } = useAuth();

	if (authLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<Settings className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
							<p className="mb-6 text-muted-foreground">
								You don't have permission to access the admin area.
							</p>
							<Button asChild variant="outline" size="lg">
								<Link to="/">Back to Home</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<Outlet />
		</div>
	);
}

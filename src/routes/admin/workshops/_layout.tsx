import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/workshops/_layout")({
	component: AdminWorkshopsLayout,
});

function AdminWorkshopsLayout() {
	const { isAuthenticated, isLoading, isAdmin } = useAuth();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>
							You must be logged in to access this page.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	if (!isAdmin) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Admin Access Required</CardTitle>
						<CardDescription>
							You need admin privileges to access the admin area.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return <Outlet />;
}

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/workshops")({
	component: AdminWorkshopsLayout,
});

function AdminWorkshopsLayout() {
	return <Outlet />;
}

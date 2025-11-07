import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/courses/_layout")({
	component: AdminCoursesLayout,
});

function AdminCoursesLayout() {
	return <Outlet />;
}

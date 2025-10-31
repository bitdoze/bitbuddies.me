import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/courses" as any)({
	component: AdminCoursesLayout,
});

function AdminCoursesLayout() {
	return <Outlet />;
}

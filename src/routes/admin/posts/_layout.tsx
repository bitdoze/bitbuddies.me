import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/posts/_layout")({
	component: AdminPostsLayout,
});

function AdminPostsLayout() {
	return (
		<div className="w-full">
			<Outlet />
		</div>
	)
}

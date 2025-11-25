import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/links/_layout")({
	component: AdminLinksLayout,
})

function AdminLinksLayout() {
	return <Outlet />
}

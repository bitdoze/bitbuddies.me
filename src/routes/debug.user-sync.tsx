import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "../components/common/SEO";
import { UserSyncDebug } from "../components/common/UserSyncDebug";

export const Route = createFileRoute("/debug/user-sync")({
	component: DebugUserSyncPage,
});

function DebugUserSyncPage() {
	return (
		<>
			<SEO
				title="User Sync Debug"
				description="Debug tool for user synchronization between Clerk and Convex."
				noIndex={true}
			/>
			<div className="container mx-auto py-8">
				<h1 className="text-3xl font-bold mb-6">User Sync Debug</h1>
				<UserSyncDebug />
			</div>
		</>
	);
}

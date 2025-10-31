import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function UserSyncDebug() {
	const { user } = useUser();
	const getOrCreateUser = useMutation(api.users.getOrCreateUser);
	const convexUser = useQuery(
		api.users.getCurrentUser,
		user ? { clerkId: user.id } : "skip",
	);
	const allUsers = useQuery(api.users.listAll);

	const handleSync = async () => {
		if (!user) {
			alert("No Clerk user found");
			return;
		}

		try {
			console.log("Attempting to sync user:", {
				clerkId: user.id,
				email: user.primaryEmailAddress?.emailAddress,
			});

			const userId = await getOrCreateUser({
				clerkId: user.id,
				email: user.primaryEmailAddress?.emailAddress ?? "",
				firstName: user.firstName ?? undefined,
				lastName: user.lastName ?? undefined,
				imageUrl: user.imageUrl ?? undefined,
			});

			console.log("User synced successfully! User ID:", userId);
			alert(`User synced successfully! User ID: ${userId}`);
		} catch (error) {
			console.error("Failed to sync user:", error);
			alert(`Failed to sync user: ${error}`);
		}
	};

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>User Sync Debug</CardTitle>
				<CardDescription>
					Debug tool for testing Clerk to Convex user synchronization
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<h3 className="font-semibold mb-2">Clerk User:</h3>
					{user ? (
						<pre className="bg-muted p-3 rounded text-xs overflow-auto">
							{JSON.stringify(
								{
									id: user.id,
									email: user.primaryEmailAddress?.emailAddress,
									firstName: user.firstName,
									lastName: user.lastName,
								},
								null,
								2,
							)}
						</pre>
					) : (
						<p className="text-muted-foreground">Not signed in</p>
					)}
				</div>

				<div>
					<h3 className="font-semibold mb-2">Convex User:</h3>
					{convexUser ? (
						<pre className="bg-muted p-3 rounded text-xs overflow-auto">
							{JSON.stringify(convexUser, null, 2)}
						</pre>
					) : (
						<p className="text-muted-foreground">Not found in Convex</p>
					)}
				</div>

				<div>
					<h3 className="font-semibold mb-2">All Convex Users:</h3>
					{allUsers && allUsers.length > 0 ? (
						<pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
							{JSON.stringify(allUsers, null, 2)}
						</pre>
					) : (
						<p className="text-muted-foreground">No users in Convex database</p>
					)}
				</div>

				<Button onClick={handleSync} disabled={!user}>
					Manual Sync User
				</Button>
			</CardContent>
		</Card>
	);
}

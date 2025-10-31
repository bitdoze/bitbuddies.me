import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";

/**
 * Provider component that automatically syncs Clerk users to Convex
 * Mount this once at the app root level
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
	const { isSignedIn, user } = useUser();
	const getOrCreateUser = useMutation(api.users.getOrCreateUser);
	const convexUser = useQuery(
		api.users.getCurrentUser,
		user ? { clerkId: user.id } : "skip",
	);
	const hasSynced = useRef(false);

	useEffect(() => {
		// Only sync if:
		// 1. User is signed in
		// 2. We have the Clerk user object
		// 3. We haven't found them in Convex yet
		// 4. We haven't already attempted to sync this session
		if (isSignedIn && user && convexUser === null && !hasSynced.current) {
			hasSynced.current = true;

			console.log("[UserSync] Syncing user to Convex:", user.id);

			getOrCreateUser({
				clerkId: user.id,
				email: user.primaryEmailAddress?.emailAddress ?? "",
				firstName: user.firstName ?? undefined,
				lastName: user.lastName ?? undefined,
				imageUrl: user.imageUrl ?? undefined,
			})
				.then((userId) => {
					console.log("[UserSync] User synced successfully:", userId);
				})
				.catch((error) => {
					console.error("[UserSync] Failed to sync user:", error);
					// Reset flag to allow retry on error
					hasSynced.current = false;
				});
		}

		// Reset sync flag when user signs out
		if (!isSignedIn && hasSynced.current) {
			console.log("[UserSync] User signed out, resetting sync flag");
			hasSynced.current = false;
		}
	}, [isSignedIn, user, convexUser, getOrCreateUser]);

	return <>{children}</>;
}

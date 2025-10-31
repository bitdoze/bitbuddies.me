import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAuth() {
	const { isSignedIn, isLoaded, user } = useUser();
	const { signOut } = useClerkAuth();
	const convexUser = useQuery(
		api.users.getCurrentUser,
		user ? { clerkId: user.id } : "skip"
	);

	const isAdmin = convexUser?.role === "admin";

	return {
		isAuthenticated: isSignedIn,
		isLoading: !isLoaded || (isSignedIn && user && !convexUser),
		user,
		convexUser,
		isAdmin,
		signOut,
	};
}

export function useRequireAuth() {
	const auth = useAuth();

	if (!auth.isLoading && !auth.isAuthenticated) {
		throw new Error("Authentication required");
	}

	return auth;
}

export function useRequireAdmin() {
	const auth = useAuth();

	if (!auth.isLoading && (!auth.isAuthenticated || !auth.isAdmin)) {
		throw new Error("Admin access required");
	}

	return auth;
}

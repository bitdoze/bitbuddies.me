import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Suppress streaming errors in development (harmless hot reload issue)
if (import.meta.env.DEV) {
	const originalError = console.error;
	console.error = (...args: any[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Invalid state: Controller is already closed")
		) {
			return; // Suppress streaming errors during hot reload
		}
		originalError.apply(console, args);
	};
}

// Create a new router instance
export const getRouter = () => {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});
};

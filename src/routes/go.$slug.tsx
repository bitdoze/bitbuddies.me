import { createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect } from "react"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export const Route = createFileRoute("/go/$slug")({
	loader: async ({ params }) => {
		const { slug } = params

		const convexUrl = import.meta.env.VITE_CONVEX_URL
		if (!convexUrl) {
			return { destinationUrl: null, error: "Configuration error" }
		}

		const client = new ConvexHttpClient(convexUrl)

		try {
			// Track click and get destination URL
			const destinationUrl = await client.mutation(api.affiliateLinks.trackClick, {
				slug,
				referrer: undefined,
				userAgent: undefined,
			})

			if (destinationUrl) {
				return { destinationUrl, error: null }
			}

			return { destinationUrl: null, error: "Link not found" }
		} catch (error) {
			console.error("Error tracking click:", error)
			return { destinationUrl: null, error: "Link not found" }
		}
	},
	component: RedirectPage,
})

function RedirectPage() {
	const { destinationUrl, error } = Route.useLoaderData()

	useEffect(() => {
		if (destinationUrl) {
			// Perform client-side redirect to external URL
			window.location.href = destinationUrl
		} else if (error) {
			// Redirect to home if link not found
			window.location.href = "/"
		}
	}, [destinationUrl, error])

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
				<p className="mt-4 text-muted-foreground">
					{error ? "Link not found, redirecting..." : "Redirecting..."}
				</p>
			</div>
		</div>
	)
}

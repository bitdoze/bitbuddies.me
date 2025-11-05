import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/debug/migrate-workshops")({
	component: MigrateWorkshopsPage,
});

function MigrateWorkshopsPage() {
	const migrateWorkshops = useMutation(api.workshops.migrateViewCounts);
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<string>("");

	const handleMigrate = async () => {
		setIsRunning(true);
		setResult("");

		try {
			await migrateWorkshops();
			setResult("Migration completed successfully! All workshops now have viewCount field.");
		} catch (error) {
			setResult(`Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Workshop Migration</CardTitle>
						<CardDescription>
							This migration adds the viewCount field to existing workshops.
							Run this once to migrate all workshops to the new schema.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							onClick={handleMigrate}
							disabled={isRunning}
							variant="default"
						>
							{isRunning ? "Running Migration..." : "Run Migration"}
						</Button>

						{result && (
							<div className={`p-4 rounded-lg ${
								result.includes("Error")
									? "bg-red-50 text-red-700 border border-red-200"
									: "bg-green-50 text-green-700 border border-green-200"
							}`}>
								{result}
							</div>
						)}

						<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important:</h3>
							<ul className="text-sm text-yellow-700 space-y-1">
								<li>This migration should only be run once</li>
								<li>Delete this route after successful migration</li>
								<li>Only administrators should access this page</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

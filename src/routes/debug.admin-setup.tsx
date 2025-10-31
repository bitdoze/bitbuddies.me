import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Shield, UserCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useAuth } from "../hooks/useAuth";
import { api } from "../../convex/_generated/api";
import { SEO } from "../components/common/SEO";

export const Route = createFileRoute("/debug/admin-setup")({
	component: AdminSetupPage,
});

function AdminSetupPage() {
	const { user, convexUser, isLoading } = useAuth();
	const allUsers = useQuery(api.users.listAll);
	const setUserRole = useMutation(api.users.setUserRole);
	const [selectedClerkId, setSelectedClerkId] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	const handleMakeAdmin = async (clerkId: string) => {
		if (!confirm(`Make this user an admin?`)) return;

		setIsProcessing(true);
		try {
			await setUserRole({
				clerkId,
				role: "admin",
			});
			alert("User role updated to admin");
		} catch (error) {
			console.error("Failed to update role:", error);
			alert(`Failed to update role: ${error}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleMakeUser = async (clerkId: string) => {
		if (!confirm(`Remove admin privileges from this user?`)) return;

		setIsProcessing(true);
		try {
			await setUserRole({
				clerkId,
				role: "user",
			});
			alert("User role updated to user");
		} catch (error) {
			console.error("Failed to update role:", error);
			alert(`Failed to update role: ${error}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleMakeMeAdmin = async () => {
		if (!user) return;
		await handleMakeAdmin(user.id);
	};

	return (
		<>
			<SEO
				title="Admin Role Management"
				description="Debug tool for setting up admin users and managing roles."
				noIndex={true}
			/>
			<div className="container mx-auto py-8 max-w-6xl space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Shield className="h-8 w-8" />
						Admin Role Management
					</h1>
					<p className="text-muted-foreground mt-2">
						Debug tool for setting up admin users
					</p>
				</div>
			</div>

			{/* Current User Info */}
			<Card>
				<CardHeader>
					<CardTitle>Current User</CardTitle>
					<CardDescription>Your authentication status</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{user ? (
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground">Email</Label>
									<p className="font-mono text-sm">
										{user.primaryEmailAddress?.emailAddress || "N/A"}
									</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Clerk ID</Label>
									<p className="font-mono text-sm break-all">{user.id}</p>
								</div>
							</div>
							<div>
								<Label className="text-muted-foreground">Current Role</Label>
								<div className="mt-1">
									{convexUser?.role === "admin" ? (
										<Badge variant="default">
											<Shield className="h-3 w-3 mr-1" />
											Admin
										</Badge>
									) : (
										<Badge variant="secondary">User</Badge>
									)}
								</div>
							</div>
							{convexUser?.role !== "admin" && (
								<div className="pt-2">
									<Button
										onClick={handleMakeMeAdmin}
										disabled={isProcessing}
										variant="default"
									>
										<UserCheck className="h-4 w-4 mr-2" />
										Make Me Admin
									</Button>
								</div>
							)}
						</div>
					) : (
						<p className="text-muted-foreground">Not signed in</p>
					)}
				</CardContent>
			</Card>

			{/* Manual Admin Setup */}
			<Card>
				<CardHeader>
					<CardTitle>Manual Admin Setup</CardTitle>
					<CardDescription>
						Set admin role by Clerk ID (paste from Clerk dashboard)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="clerkId">Clerk User ID</Label>
							<Input
								id="clerkId"
								value={selectedClerkId}
								onChange={(e) => setSelectedClerkId(e.target.value)}
								placeholder="user_2..."
								className="font-mono"
							/>
						</div>
						<Button
							onClick={() => handleMakeAdmin(selectedClerkId)}
							disabled={!selectedClerkId || isProcessing}
						>
							<Shield className="h-4 w-4 mr-2" />
							Make Admin
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* All Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
					<CardDescription>
						{allUsers?.length ?? 0} user(s) in database
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!allUsers || allUsers.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No users found. Sign in to sync your user to Convex.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Clerk ID</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{allUsers.map((u) => (
									<TableRow key={u._id}>
										<TableCell className="font-medium">{u.email}</TableCell>
										<TableCell className="font-mono text-xs">
											{u.clerkId}
										</TableCell>
										<TableCell>
											{u.role === "admin" ? (
												<Badge variant="default">
													<Shield className="h-3 w-3 mr-1" />
													Admin
												</Badge>
											) : (
												<Badge variant="secondary">User</Badge>
											)}
										</TableCell>
										<TableCell>
											{u.isActive ? (
												<Badge variant="outline">Active</Badge>
											) : (
												<Badge variant="destructive">Inactive</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											{u.role === "admin" ? (
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleMakeUser(u.clerkId)}
													disabled={isProcessing}
												>
													Remove Admin
												</Button>
											) : (
												<Button
													size="sm"
													onClick={() => handleMakeAdmin(u.clerkId)}
													disabled={isProcessing}
												>
													<Shield className="h-3 w-3 mr-1" />
													Make Admin
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Warning */}
			<Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
				<CardHeader>
					<CardTitle className="text-yellow-900 dark:text-yellow-100">
						⚠️ Security Warning
					</CardTitle>
					<CardDescription className="text-yellow-800 dark:text-yellow-200">
						This page should be removed or protected in production
					</CardDescription>
				</CardHeader>
				<CardContent className="text-yellow-900 dark:text-yellow-100">
					<p className="text-sm">
						This debug tool allows anyone to make themselves an admin. In
						production, you should either:
					</p>
					<ul className="list-disc list-inside text-sm mt-2 space-y-1">
						<li>Delete this route entirely</li>
						<li>Protect it with environment variable checks</li>
						<li>
							Only call <code>setUserRole</code> from the Convex dashboard
						</li>
						<li>
							Implement proper admin authorization checks in the mutation
						</li>
					</ul>
				</CardContent>
			</Card>
			</div>
		</>
	);
}

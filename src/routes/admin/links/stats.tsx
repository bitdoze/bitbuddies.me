import { createFileRoute, Link } from "@tanstack/react-router"
import {
	AlertCircle,
	ArrowLeft,
	BarChart3,
	Calendar,
	ExternalLink,
	Filter,
	Globe,
	Link2,
	MousePointer,
	TrendingUp,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminShell } from "@/components/admin/AdminShell"
import { AdminStatCard } from "@/components/admin/AdminStatCard"
import { AdminTable } from "@/components/admin/AdminTable"
import { SEO } from "@/components/common/SEO"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import {
	useAffiliateLinks,
	useLinkStats,
	useLinkClicksByDate,
	useLinkClicksByReferrer,
	useLinkSummary,
} from "@/hooks/useAffiliateLinks"
import type { Doc, Id } from "@/convex/_generated/dataModel"

type ClickStat = {
	_id: Id<"linkClicks">
	linkId: Id<"affiliateLinks">
	referrer?: string
	userAgent?: string
	clickedAt: number
	link: { name: string; slug: string } | null
}

type DateCount = { date: string; count: number }
type ReferrerCount = { referrer: string; count: number }

const clicksChartConfig = {
	clicks: {
		label: "Clicks",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig

const referrerChartConfig = {
	count: {
		label: "Clicks",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig

export const Route = createFileRoute("/admin/links/stats")({
	component: LinkStatsPage,
})

function LinkStatsPage() {
	const { isAuthenticated, isLoading: authLoading, isAdmin, user } = useAuth()
	const links = useAffiliateLinks()

	const [selectedLinkId, setSelectedLinkId] = useState<string>("all")
	const [referrerFilter, setReferrerFilter] = useState("")
	const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "all">("30")

	const dateRangeFilter = useMemo(() => {
		if (dateRange === "all") return {}
		const days = Number.parseInt(dateRange)
		const startDate = Date.now() - days * 24 * 60 * 60 * 1000
		return { startDate }
	}, [dateRange])

	const selectedLink = useMemo(() => {
		return selectedLinkId !== "all" ? (selectedLinkId as Id<"affiliateLinks">) : undefined
	}, [selectedLinkId])

	const daysForQuery = useMemo(() => {
		return dateRange === "all" ? 365 : Number.parseInt(dateRange)
	}, [dateRange])

	const summary = useLinkSummary(user?.id)

	const clickStats = useLinkStats(user?.id, {
		linkId: selectedLink,
		referrer: referrerFilter || undefined,
		startDate: dateRangeFilter.startDate,
	})

	const clicksByDate = useLinkClicksByDate(user?.id, {
		linkId: selectedLink,
		days: daysForQuery,
	})

	const clicksByReferrer = useLinkClicksByReferrer(user?.id, {
		linkId: selectedLink,
		startDate: dateRangeFilter.startDate,
	})

	// Transform data for charts
	const clicksChartData = useMemo(() => {
		if (!clicksByDate) return []
		return clicksByDate.map((item: DateCount) => ({
			date: item.date,
			clicks: item.count,
		}))
	}, [clicksByDate])

	const referrerChartData = useMemo(() => {
		if (!clicksByReferrer) return []
		return clicksByReferrer.slice(0, 8).map((item: ReferrerCount) => ({
			referrer: item.referrer.length > 20 
				? item.referrer.substring(0, 20) + "..." 
				: item.referrer,
			count: item.count,
			fullReferrer: item.referrer,
		}))
	}, [clicksByReferrer])

	if (authLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
							<p className="text-muted-foreground">
								You must be logged in to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isAdmin) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Admin Access Required</h1>
							<p className="text-muted-foreground">
								You need admin privileges to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString()
	}

	const totalClicks = summary?.totalClicks ?? 0
	const clicksLast24h = summary?.clicksLast24h ?? 0
	const filteredClicksCount = clickStats?.length ?? 0
	const topReferrer = clicksByReferrer?.[0]?.referrer ?? "N/A"

	return (
		<>
			<SEO
				title="Link Statistics"
				description="View click statistics and analytics for your affiliate links."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Analytics"
						title="Link Statistics"
						description="Track clicks, referrers, and performance of your affiliate links."
						actions={
							<Button asChild variant="outline" size="sm">
								<Link to="/admin/links">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Links
								</Link>
							</Button>
						}
						stats={[
							{ label: "Total Clicks", value: totalClicks },
							{ label: "Last 24h", value: clicksLast24h },
							{ label: "Filtered Results", value: filteredClicksCount },
							{ label: "Top Referrer", value: topReferrer.slice(0, 20) },
						]}
					/>

					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<AdminStatCard
							label="Total clicks"
							value={totalClicks}
							description="All time"
							icon={<MousePointer className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Last 24 hours"
							value={clicksLast24h}
							description="Recent activity"
							icon={<TrendingUp className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Unique referrers"
							value={clicksByReferrer?.length ?? 0}
							description="Traffic sources"
							icon={<Globe className="h-4 w-4" />}
						/>
						<AdminStatCard
							label="Active days"
							value={clicksByDate?.length ?? 0}
							description={`In selected period`}
							icon={<Calendar className="h-4 w-4" />}
						/>
					</div>

					{/* Filters */}
					<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Filter className="h-5 w-5" />
							</div>
							<h2 className="text-xl font-bold">Filters</h2>
						</div>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div className="space-y-2">
								<Label htmlFor="link-filter">Link</Label>
								<Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
									<SelectTrigger id="link-filter">
										<SelectValue placeholder="All links" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Links</SelectItem>
										{links?.map((link) => (
											<SelectItem key={link._id} value={link._id}>
												{link.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="date-range">Date Range</Label>
								<Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
									<SelectTrigger id="date-range">
										<SelectValue placeholder="Select range" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="7">Last 7 days</SelectItem>
										<SelectItem value="30">Last 30 days</SelectItem>
										<SelectItem value="90">Last 90 days</SelectItem>
										<SelectItem value="all">All time</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="referrer-filter">Referrer</Label>
								<Input
									id="referrer-filter"
									value={referrerFilter}
									onChange={(e) => setReferrerFilter(e.target.value)}
									placeholder="Filter by referrer..."
								/>
							</div>
							<div className="flex items-end">
								<Button
									variant="outline"
									onClick={() => {
										setSelectedLinkId("all")
										setReferrerFilter("")
										setDateRange("30")
									}}
								>
									Reset Filters
								</Button>
							</div>
						</div>
					</div>

					{/* Charts Section */}
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Clicks Over Time Chart */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-primary" />
									Clicks Over Time
								</CardTitle>
								<CardDescription>
									Daily click activity for the selected period
								</CardDescription>
							</CardHeader>
							<CardContent>
								{clicksChartData.length > 0 ? (
									<ChartContainer config={clicksChartConfig} className="h-[300px] w-full">
										<AreaChart
											accessibilityLayer
											data={clicksChartData}
											margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
										>
											<defs>
												<linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
													<stop
														offset="5%"
														stopColor="var(--color-clicks)"
														stopOpacity={0.8}
													/>
													<stop
														offset="95%"
														stopColor="var(--color-clicks)"
														stopOpacity={0.1}
													/>
												</linearGradient>
											</defs>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey="date"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												minTickGap={32}
												tickFormatter={(value) => {
													const date = new Date(value)
													return date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})
												}}
											/>
											<YAxis
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												allowDecimals={false}
											/>
											<ChartTooltip
												cursor={false}
												content={
													<ChartTooltipContent
														labelFormatter={(value) => {
															return new Date(value).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
																year: "numeric",
															})
														}}
														indicator="dot"
													/>
												}
											/>
											<Area
												dataKey="clicks"
												type="monotone"
												fill="url(#fillClicks)"
												stroke="var(--color-clicks)"
												strokeWidth={2}
											/>
										</AreaChart>
									</ChartContainer>
								) : (
									<div className="flex h-[300px] items-center justify-center">
										<p className="text-muted-foreground">No data available</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Clicks by Referrer Chart */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="h-5 w-5 text-primary" />
									Top Referrers
								</CardTitle>
								<CardDescription>
									Traffic sources for your affiliate links
								</CardDescription>
							</CardHeader>
							<CardContent>
								{referrerChartData.length > 0 ? (
									<ChartContainer config={referrerChartConfig} className="h-[300px] w-full">
										<BarChart
											accessibilityLayer
											data={referrerChartData}
											layout="vertical"
											margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
										>
											<CartesianGrid horizontal={false} />
											<YAxis
												dataKey="referrer"
												type="category"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												width={100}
												fontSize={12}
											/>
											<XAxis
												type="number"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												allowDecimals={false}
											/>
											<ChartTooltip
												cursor={false}
												content={
													<ChartTooltipContent
														labelKey="fullReferrer"
														indicator="line"
													/>
												}
											/>
											<Bar
												dataKey="count"
												fill="var(--color-count)"
												radius={[0, 4, 4, 0]}
											/>
										</BarChart>
									</ChartContainer>
								) : (
									<div className="flex h-[300px] items-center justify-center">
										<p className="text-muted-foreground">No data available</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Top Links */}
					{summary?.topLinks && summary.topLinks.length > 0 && (
						<AdminTable
							title="Top Performing Links"
							description="Links with the most clicks."
							badge={<Badge variant="secondary">{summary.topLinks.length}</Badge>}
						>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Rank</TableHead>
											<TableHead>Link Name</TableHead>
											<TableHead>Short URL</TableHead>
											<TableHead>Clicks</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{summary.topLinks.map((link: Doc<"affiliateLinks">, index: number) => (
											<TableRow key={link._id}>
												<TableCell>
													<Badge variant="outline">#{index + 1}</Badge>
												</TableCell>
												<TableCell>
													<span className="font-medium">{link.name}</span>
												</TableCell>
												<TableCell>
													<code className="rounded bg-muted px-2 py-1 text-sm">
														/go/{link.slug}
													</code>
												</TableCell>
												<TableCell>
													<span className="font-semibold">{link.clickCount}</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</AdminTable>
					)}

					{/* Clicks by Referrer Table */}
					{clicksByReferrer && clicksByReferrer.length > 0 && (
						<AdminTable
							title="Clicks by Referrer"
							description="Traffic sources for your affiliate links."
							badge={<Badge variant="secondary">{clicksByReferrer.length}</Badge>}
						>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Referrer</TableHead>
											<TableHead>Clicks</TableHead>
											<TableHead>Percentage</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{clicksByReferrer.slice(0, 10).map((item: ReferrerCount) => {
											const total = clicksByReferrer.reduce((sum: number, r: ReferrerCount) => sum + r.count, 0)
											const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0"
											return (
												<TableRow key={item.referrer}>
													<TableCell>
														<div className="flex items-center gap-2">
															<Globe className="h-4 w-4 text-muted-foreground" />
															<span className="max-w-[300px] truncate">
																{item.referrer}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<span className="font-semibold">{item.count}</span>
													</TableCell>
													<TableCell>
														<Badge variant="secondary">{percentage}%</Badge>
													</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</div>
						</AdminTable>
					)}

					{/* Recent Clicks */}
					<AdminTable
						title="Recent Clicks"
						description="Individual click records with details."
						badge={<Badge variant="secondary">{filteredClicksCount}</Badge>}
					>
						{!clickStats || clickStats.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<BarChart3 className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No clicks found
									</h3>
									<p className="text-sm text-muted-foreground">
										No clicks match the current filters.
									</p>
								</div>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Link</TableHead>
											<TableHead>Referrer</TableHead>
											<TableHead>Date/Time</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{clickStats.slice(0, 50).map((click: ClickStat) => (
											<TableRow key={click._id}>
												<TableCell>
													<div className="flex items-center gap-2">
														<Link2 className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">
															{click.link?.name ?? "Unknown"}
														</span>
														{click.link?.slug && (
															<code className="rounded bg-muted px-1.5 py-0.5 text-xs">
																/go/{click.link.slug}
															</code>
														)}
													</div>
												</TableCell>
												<TableCell>
													{click.referrer ? (
														<div className="flex items-center gap-2 max-w-[250px]">
															<ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
															<span className="truncate text-sm">
																{click.referrer}
															</span>
														</div>
													) : (
														<span className="text-muted-foreground">Direct</span>
													)}
												</TableCell>
												<TableCell>
													<span className="text-sm text-muted-foreground">
														{formatDate(click.clickedAt)}
													</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</AdminTable>
				</AdminShell>
			</div>
		</>
	)
}

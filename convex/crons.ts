/**
 * Cron jobs - Scheduled tasks for the application
 * Runs automated tasks like syncing YouTube videos daily
 */

import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

/**
 * Sync YouTube videos daily at 6 AM UTC
 * Fetches latest videos from all active YouTube channels
 */
crons.daily(
	"sync-youtube-videos",
	{ hourUTC: 6, minuteUTC: 0 },
	internal.youtubeVideos.syncAllChannels,
)

/**
 * Clean up stale YouTube videos daily at 7 AM UTC
 * Removes videos older than two weeks to keep the library fresh
 */
crons.daily(
	"cleanup-youtube-videos",
	{ hourUTC: 7, minuteUTC: 0 },
	internal.youtubeVideos.cleanupOldVideos,
)

export default crons

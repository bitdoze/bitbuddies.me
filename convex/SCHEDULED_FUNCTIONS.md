# Scheduled Functions & Cron Jobs - Implementation Guide

This document describes the scheduled functions and cron jobs implementation for YouTube video synchronization, including all security improvements, monitoring capabilities, and best practices.

## Overview

The system uses Convex scheduled functions to:
1. **Sync YouTube videos daily** - Fetches latest videos from tracked channels
2. **Cleanup old videos** - Removes videos older than 14 days to keep storage fresh

## Architecture

### Cron Jobs (`convex/crons.ts`)

```typescript
// Runs daily at 6 AM UTC
crons.daily("sync-youtube-videos", ...)

// Runs daily at 7 AM UTC (1 hour after sync)
crons.daily("cleanup-youtube-videos", ...)
```

**Why 1-hour gap?** Ensures sync completes before cleanup runs, preventing race conditions.

### Function Types Used

- **`internalMutation`** - Database-only operations (cleanup, updates)
- **`internalAction`** - External API calls (fetching YouTube RSS feeds)
- **`action`** - Public functions (manual admin operations)
- **`query`** - Read-only operations (monitoring, stats)

## Security Improvements ✅

### 1. Admin Authorization

All manual operations now require admin role verification:

```typescript
export const manualSyncChannel = action({
  args: {
    clerkId: v.string(), // ✅ Required for authorization
    channelDbId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.clerkId); // ✅ Blocks non-admins
    // ... proceed with sync
  },
});
```

**Functions protected:**
- `manualSyncChannel` - Manual sync of single channel
- `manualSyncAllChannels` - Manual sync of all channels
- `manualCleanupOldVideos` - Manual cleanup with custom parameters

### 2. Safety Limits

**Cleanup batch size:** Max 100 videos per mutation run
- Prevents timeout errors
- Automatically schedules continuation if more videos need cleanup
- Logs warnings if removing > 50 videos

**Manual cleanup limits:**
- Minimum retention: 7 days (cannot delete newer videos)
- Maximum per run: 500 videos
- Dry-run mode available for preview

## Performance Optimizations ✅

### 1. Batched Cleanup

Instead of loading all old videos at once:

```typescript
// ❌ OLD: Could load thousands of records
const oldVideos = await ctx.db.query("youtubeVideos")
  .withIndex("by_published_at", (q) => q.lt("publishedAt", cutoff))
  .collect() // Loads everything!

// ✅ NEW: Batched with limit
const oldVideos = await ctx.db.query("youtubeVideos")
  .withIndex("by_published_at", (q) => q.lt("publishedAt", cutoff))
  .take(maxBatchSize) // Only 100 at a time
```

**Auto-continuation:** If more videos need cleanup, automatically schedules next batch:

```typescript
if (hasMore) {
  await ctx.scheduler.runAfter(
    1000, // Wait 1 second between batches
    internal.youtubeVideos.cleanupOldVideos,
    { batchSize: maxBatchSize },
  )
}
```

### 2. Efficient Count Updates

Instead of recounting all videos after deletion:

```typescript
// ❌ OLD: Query all videos just to count
const remainingVideos = await ctx.db
  .query("youtubeVideos")
  .withIndex("by_channel_ref", (q) => q.eq("channelRef", channelRef))
  .collect()
await ctx.db.patch(channelRef, { videoCount: remainingVideos.length })

// ✅ NEW: Arithmetic decrement
const newCount = Math.max(0, channel.videoCount - removedCount)
await ctx.db.patch(channelRef, { videoCount: newCount })
```

**Benefit:** Avoids expensive queries, especially for channels with many videos.

### 3. Deduplication

Prevents processing duplicate videos from RSS feed:

```typescript
// Remove duplicates by videoId before processing
const uniqueVideos = Array.from(
  new Map(videos.map((v) => [v.videoId, v])).values(),
)
```

## Monitoring & Observability ✅

### 1. Comprehensive Logging

All operations log detailed information:

```typescript
// Sync start
console.log(`Starting sync for channel: ${channel.channelName}`)

// Sync success
console.log(`✓ Sync completed for ${channel.channelName}:
  ${newVideos} new, ${updatedVideos} updated, ${totalVideos} total`)

// Sync failure
console.error(`✗ Sync failed for ${channel.channelName}: ${errorMessage}`)

// Daily summary
console.log(`Daily sync completed in ${duration}s:
  ${successCount} succeeded, ${failureCount} failed`)
```

### 2. Health Monitoring

**`getSyncHealth()` query** - Returns channels with issues:

```typescript
{
  totalActiveChannels: 5,
  healthyChannels: 3,
  issues: [
    {
      channelName: "Example Channel",
      issue: "No sync for 3 days",
      severity: "error",
      lastSyncedAt: 1234567890,
    },
    // ...
  ],
}
```

**Issue types detected:**
- Never synced (severity: error)
- Sync failed (severity: error)
- No sync for 3+ days (severity: error)
- Sync overdue by 12+ hours (severity: warning)

### 3. Channel Sync History

**`getChannelSyncHistory(channelId)` query** - Debugging tool:

```typescript
{
  channel: { name, videoCount, isActive },
  syncStatus: { lastSyncedAt, lastSyncStatus, lastSyncError },
  recentVideos: [/* 10 most recent */],
}
```

## Usage Guide

### Manual Sync (Admin Only)

**Sync single channel:**
```typescript
await convex.mutation(api.youtubeVideos.manualSyncChannel, {
  clerkId: user.clerkId,
  channelDbId: "j57abc123...",
})
```

**Sync all channels:**
```typescript
await convex.mutation(api.youtubeVideos.manualSyncAllChannels, {
  clerkId: user.clerkId,
})
```

### Manual Cleanup (Admin Only)

**Dry run (preview only):**
```typescript
const result = await convex.action(api.youtubeVideos.manualCleanupOldVideos, {
  clerkId: user.clerkId,
  daysOld: 14,
  dryRun: true, // Won't delete anything
})
// Returns: { wouldRemove: 150, affectedChannels: [...] }
```

**Actual cleanup:**
```typescript
const result = await convex.action(api.youtubeVideos.manualCleanupOldVideos, {
  clerkId: user.clerkId,
  daysOld: 30, // Delete videos older than 30 days
  dryRun: false,
})
```

**Safety features:**
- Minimum 7 days retention (prevents accidental deletion of recent videos)
- Maximum 500 videos per run (prevents massive deletions)
- Dry-run mode for testing

### Check Sync Health

```typescript
const health = await convex.query(api.youtubeChannels.getSyncHealth, {})

if (health.issues.length > 0) {
  console.warn("Sync health issues detected:", health.issues)
  // Alert admin, send notification, etc.
}
```

## Error Handling

### Mutations (Cleanup)
- **Guaranteed execution:** Convex automatically retries internal errors
- **Fail on developer errors:** Fix code and redeploy
- **Atomic:** Either completes fully or rolls back

### Actions (Sync)
- **At most once:** Not automatically retried (may have side effects)
- **Per-channel error handling:** One channel failure doesn't stop others
- **Status tracking:** Errors stored in `lastSyncError` field

## Best Practices

### ✅ DO
- Always require admin authorization for manual operations
- Use batching for operations that process many records
- Log comprehensive information for debugging
- Monitor sync health regularly
- Use dry-run mode before large deletions
- Schedule actions with `runAfter(0)` for conditional side effects

### ❌ DON'T
- Don't call public actions from scheduled functions (use internal functions)
- Don't process unbounded record sets without pagination
- Don't delete videos less than 7 days old
- Don't ignore sync health warnings
- Don't run manual sync/cleanup during scheduled cron runs

## Monitoring Checklist

Daily/weekly checks:
- [ ] Check `getSyncHealth()` for issues
- [ ] Verify all active channels synced in last 24 hours
- [ ] Review logs for unusual patterns (many failures, large cleanups)
- [ ] Confirm video counts are reasonable per channel

Monthly checks:
- [ ] Review retention policy (14 days still appropriate?)
- [ ] Check for channels with consistently low engagement
- [ ] Verify cron job timing still optimal
- [ ] Review and clean up inactive channels

## Troubleshooting

### Channel not syncing
1. Check `getChannelSyncHistory(channelId)` for errors
2. Verify channel is active: `isActive: true`
3. Check RSS feed URL is valid
4. Look for `lastSyncError` message
5. Try manual sync to see detailed error

### Cleanup not working
1. Check logs for batch completion messages
2. Verify `by_published_at` index exists
3. Check if videos are actually older than 14 days
4. Run manual cleanup with dry-run to preview

### Too many videos being deleted
1. Review cleanup logs for warning messages
2. Check `channelsAffected` count
3. Verify retention period is correct (14 days)
4. Consider increasing retention if needed

## Future Improvements

Potential enhancements:
- Email/Slack notifications for sync failures
- Dashboard widget for sync health
- Per-channel retention policies
- Automatic channel deactivation after repeated failures
- Video view metrics tracking over time
- A/B testing different sync schedules

## Database Schema Notes

### Indexes Used
- `youtubeVideos.by_published_at` - Cleanup queries
- `youtubeVideos.by_video_id` - Deduplication checks
- `youtubeVideos.by_channel_ref` - Per-channel queries
- `youtubeChannels.by_is_active` - Active channel filtering

### Fields Tracked
- `lastSyncedAt` - When channel last synced
- `lastSyncStatus` - "success" | "failed"
- `lastSyncError` - Error message if failed
- `videoCount` - Total videos for channel
- `syncedAt` - When each video was last synced

## Conclusion

The improved implementation provides:
- ✅ **Security** - Admin-only access to sensitive operations
- ✅ **Reliability** - Batching prevents timeouts and failures
- ✅ **Performance** - Efficient queries and updates
- ✅ **Observability** - Comprehensive logging and monitoring
- ✅ **Safety** - Multiple safeguards against accidental data loss

All recommendations from the Convex documentation have been implemented.

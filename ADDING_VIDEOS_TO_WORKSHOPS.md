# Adding Videos to Workshops

This guide explains how to add video content to your workshops in BitBuddies.

## Video Support

Workshops support video embedding from:
- **YouTube** - Most common, recommended for public content
- **Bunny Stream** - For private/premium video hosting

## Method 1: Add Video During Workshop Creation

When creating a workshop at `/admin/workshops/create`:

1. **Scroll to "Video Recording (Optional)" section**
2. **Choose your video provider** from the dropdown:
   - YouTube
   - Bunny Stream
3. **Add the video in ONE of these ways**:

### Option A: Paste Full YouTube URL (Easiest)
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
Or short URL:
```
https://youtu.be/dQw4w9WgXcQ
```

**Where to paste**: In the "Video URL" field

The system will automatically:
- Extract the video ID (`dQw4w9WgXcQ`)
- Convert it to embed format
- Display it properly in the workshop

### Option B: Use Video ID + Provider
1. Select "YouTube" as Video Provider
2. Enter just the Video ID: `dQw4w9WgXcQ`
3. Leave Video URL empty

### Option C: Paste Embed URL
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Where to paste**: In the "Video URL" field

## Method 2: Add Video to Existing Workshop

1. Go to `/admin/workshops`
2. Click the edit icon (pencil) next to the workshop
3. Scroll to "Video Recording (Optional)" section
4. Follow the same options as Method 1
5. Click "Update Workshop"

## Finding YouTube Video ID

From any YouTube URL, the video ID is the part after `v=` or after `youtu.be/`:

### Examples:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                 ^^^^^^^^^^^^ This is the ID

https://youtu.be/dQw4w9WgXcQ
                 ^^^^^^^^^^^^ This is the ID

https://www.youtube.com/embed/dQw4w9WgXcQ
                              ^^^^^^^^^^^^ This is the ID
```

## Video Display

Videos will appear:
- **For authenticated users**: Full embedded player at the top of the workshop page
- **For non-authenticated users**: Video preview is hidden (encourages sign-up)

## Common Issues & Solutions

### ❌ Issue: Video not showing
**Possible causes**:
1. Workshop has no video configured (videoUrl and videoId are both empty)
2. Video ID is incorrect
3. YouTube video is private or deleted

**Solution**:
1. Go to workshop edit page
2. Check Video URL field - should have a valid YouTube URL
3. Test the URL in a browser first
4. Re-save the workshop

### ❌ Issue: "This video is unavailable"
**Cause**: YouTube video is private or has embedding disabled

**Solution**:
1. Make sure the YouTube video is:
   - Public or Unlisted (not Private)
   - Allows embedding (check video settings on YouTube)
2. Update the workshop with a different video

### ❌ Issue: Seeing iframe HTML in video field
**Cause**: Someone pasted the entire `<iframe>` code instead of just the URL

**Solution**:
1. Go to `/debug/workshops-video`
2. Find the workshop with the issue
3. Click "Quick Fix" button
4. It will extract the video ID and clean up the field

## Video Best Practices

### 1. Video Resolution
- Upload videos in at least **1080p** (1920×1080)
- 16:9 aspect ratio (recommended)

### 2. Video Length
- Keep workshop videos **under 2 hours** for better engagement
- Break long content into multiple workshops
- Update the "Duration" field to match video length

### 3. Video Hosting
- **YouTube**: Great for public content, free hosting, good SEO
- **Bunny Stream**: Better for premium/private content, more control

### 4. Video Content
- Add clear title and description on YouTube
- Use timestamps in video description for easy navigation
- Enable subtitles/captions for accessibility

### 5. Thumbnails
- YouTube thumbnail should match workshop cover image
- Use consistent branding across videos

## Adding Multiple Videos

For workshops with multiple videos/lessons:

1. **Option A: Single Workshop with Playlist**
   - Create YouTube playlist
   - Link to playlist in workshop description
   - Use main video as workshop video

2. **Option B: Multiple Workshops (Recommended)**
   - Create separate workshop for each video
   - Use tags to group related workshops
   - Add series number in title: "Workshop Name - Part 1"

## Video for Live Workshops

For live workshops (isLive = true):

**Before the event**:
- Leave video fields empty or add a teaser video
- Set start date and time

**During the event**:
- Can add live stream embed URL if streaming

**After the event**:
- Upload recording to YouTube
- Edit workshop and add recording URL
- Video will appear with "Recording Available" badge

## Bunny Stream Integration

For Bunny Stream videos:

1. **Select "Bunny Stream" as provider**
2. **Enter the Bunny video ID or embed URL**
3. Format: `https://iframe.mediadelivery.net/embed/[LIBRARY_ID]/[VIDEO_ID]`

Example:
```
https://iframe.mediadelivery.net/embed/12345/abcd-1234-efgh-5678
```

## Example: Complete Video Setup

### Creating Workshop with Video

```yaml
Title: "Building a REST API with Node.js"
Video Provider: YouTube
Video URL: https://www.youtube.com/watch?v=fgTGADljAeg
Duration: 45 (minutes)
```

**Result**:
- Video ID automatically extracted: `fgTGADljAeg`
- Embed URL generated: `https://www.youtube.com/embed/fgTGADljAeg`
- Video displays at top of workshop page (for authenticated users)
- Duration shown as 45 minutes in workshop metadata

## Troubleshooting Tools

### Debug Page: `/debug/workshops-video`

Use this page to:
- View all workshops and their video configuration
- See raw video data (URL, ID, provider)
- Preview embedded videos
- Fix iframe HTML issues with one click
- Extract video IDs from malformed URLs

**When to use**:
- Video not displaying correctly
- Need to check video configuration
- Someone pasted iframe HTML by mistake
- Need to bulk-check all workshop videos

## API Reference

### Workshop Video Fields

```typescript
{
  videoProvider?: "youtube" | "bunny",
  videoId?: string,           // Just the ID: "dQw4w9WgXcQ"
  videoUrl?: string,          // Full URL or embed URL
}
```

### Video Logic

1. If `videoUrl` exists:
   - Check if already embed format → use as-is
   - Extract ID from YouTube URL → convert to embed
   - Otherwise use URL directly

2. If `videoId` exists (and no URL):
   - If provider is "bunny" → use as-is
   - Otherwise create YouTube embed: `https://www.youtube.com/embed/{videoId}`

3. If neither exists:
   - No video displayed
   - Workshop still works fine (text-only content)

## Summary

✅ **Easiest method**: Paste YouTube URL in Video URL field
✅ **Video is optional**: Workshops work fine without videos
✅ **Auto-conversion**: System handles URL formatting
✅ **Debug tool available**: `/debug/workshops-video` for troubleshooting
✅ **Authenticated only**: Videos only shown to signed-in users

For most use cases, just paste the YouTube URL and you're done! 🎥

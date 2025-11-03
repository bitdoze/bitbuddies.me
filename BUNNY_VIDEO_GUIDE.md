# Bunny Video Integration Guide

## Overview

BitBuddies supports **Bunny.net Stream** for video hosting with automatic URL conversion and proper embedding.

## ✅ What's Supported

- ✅ Bunny Stream play URLs (automatically converted)
- ✅ Bunny Stream embed URLs (used as-is)
- ✅ Proper 16:9 responsive video player
- ✅ Auto-conversion from play to embed format
- ✅ YouTube fallback support

## 🎥 Bunny URL Formats

### Play URL (Input)
```
https://iframe.mediadelivery.net/play/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f
```

### Embed URL (Auto-converted)
```
https://iframe.mediadelivery.net/embed/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f?autoplay=false&loop=false&muted=false&preload=true&responsive=true
```

The system **automatically converts** play URLs to embed URLs with proper parameters.

## 📝 How to Add Bunny Videos

### In Admin Panel (`/admin/courses/:id/lessons`)

1. **Create or Edit Lesson**
2. **Select Video Provider**: Choose "Bunny Stream"
3. **Paste Video URL**: Use either format:
   - Play URL: `https://iframe.mediadelivery.net/play/LIBRARY_ID/VIDEO_ID`
   - Embed URL: `https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID?...`
4. **Save Lesson**

The system will automatically:
- ✅ Detect the URL format
- ✅ Convert play URLs to embed format
- ✅ Add proper embed parameters
- ✅ Display with responsive 16:9 aspect ratio

### Example Admin Form

```
Video Provider: [Bunny Stream ▼]

Video URL:
┌─────────────────────────────────────────────────────────────┐
│ https://iframe.mediadelivery.net/play/149616/8adcaaab...   │
└─────────────────────────────────────────────────────────────┘
💡 Tip: Use the Bunny play URL (e.g., /play/...) - it will be
   automatically converted to embed format
```

## 🔧 How It Works

### Backend (Convex)
Your lesson schema already supports Bunny videos:
```typescript
{
  videoProvider: "bunny" | "youtube",
  videoUrl: string,
  videoId: string (optional),
}
```

### Frontend URL Conversion

**In Lesson Pages** (`courses.$courseSlug.$lessonSlug.tsx`):
```typescript
function getBunnyEmbedUrl(url: string): string {
  // Already embed URL? Return as-is
  if (url.includes("/embed/")) {
    return url;
  }

  // Extract library ID and video ID from play URL
  const playMatch = url.match(/\/play\/(\d+)\/([a-f0-9-]+)/);
  if (playMatch) {
    const [, libraryId, videoId] = playMatch;
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
  }

  return url; // Unknown format, return as-is
}
```

**In Course Overview** (`courses.$slug.tsx`):
Similar conversion logic applies when showing lessons in accordion.

## 🎨 Video Player Features

### Embed Parameters
- `autoplay=false` - Don't auto-play on load
- `loop=false` - Don't loop video
- `muted=false` - Audio enabled by default
- `preload=true` - Preload video metadata
- `responsive=true` - Responsive sizing

### Styling
- 16:9 aspect ratio (56.25% padding-bottom)
- Rounded corners (`rounded-lg`)
- Shadow effect (`shadow-lg`)
- Full-width responsive
- Border removed for seamless look

## 📋 Getting Bunny Video URLs

### From Bunny Dashboard

1. **Go to**: [Bunny.net Dashboard](https://dash.bunny.net/)
2. **Navigate to**: Stream → Video Library
3. **Select Your Video**
4. **Copy URL**: Either format works:
   - **Play URL**: From "Direct Play URL" field
   - **Embed Code**: Extract URL from iframe src

### Example Embed Code from Bunny
```html
<div style="position:relative;padding-top:56.25%;">
  <iframe
    src="https://iframe.mediadelivery.net/embed/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f?autoplay=false&loop=false&muted=false&preload=false&responsive=true"
    loading="lazy"
    style="border:0;position:absolute;top:0;height:100%;width:100%;"
    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
    allowfullscreen="true">
  </iframe>
</div>
```

**Just copy the `src` URL** and paste it into the Video URL field!

## ✅ What You Can Paste

All these formats work:

### ✅ Play URL (Recommended)
```
https://iframe.mediadelivery.net/play/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f
```
**System converts to proper embed format automatically**

### ✅ Embed URL
```
https://iframe.mediadelivery.net/embed/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f
```
**Used as-is (parameters may be added)**

### ✅ Embed URL with Parameters
```
https://iframe.mediadelivery.net/embed/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f?autoplay=false&loop=false&muted=false&preload=false&responsive=true
```
**Used exactly as provided**

## 🚫 What NOT to Paste

### ❌ Full HTML Iframe Code
```html
<!-- DON'T paste the entire iframe tag -->
<iframe src="https://iframe.mediadelivery.net/..."></iframe>
```
**Solution**: Extract just the `src` URL

### ❌ Wrapped Div Code
```html
<!-- DON'T paste the wrapper div -->
<div style="..."><iframe src="..."></iframe></div>
```
**Solution**: Extract just the iframe's `src` URL

## 🔍 Troubleshooting

### Video Not Displaying?

**Check these:**
1. ✅ Video Provider set to "Bunny Stream"
2. ✅ URL contains `/play/` or `/embed/`
3. ✅ Library ID and Video ID are present in URL
4. ✅ Lesson is published (`isPublished: true`)
5. ✅ Video is published in Bunny dashboard

### Wrong Aspect Ratio?

- The system automatically uses 16:9 (56.25% padding-bottom)
- Bunny videos should adapt to this automatically with `responsive=true`
- If issues persist, check Bunny video settings

### Video Loading Slowly?

- Bunny Stream uses adaptive bitrate streaming
- Videos will adjust quality based on connection speed
- Consider setting `preload=true` (default in our system)

## 📊 URL Pattern Reference

### Bunny Play URL Pattern
```
https://iframe.mediadelivery.net/play/[LIBRARY_ID]/[VIDEO_ID]
                                     └────┬────┘  └────┬────┘
                                      Numeric     UUID format
                                      (149616)    (8adcaaab-aebd...)
```

### Bunny Embed URL Pattern
```
https://iframe.mediadelivery.net/embed/[LIBRARY_ID]/[VIDEO_ID]?[PARAMS]
```

## 🎯 Best Practices

1. **Always use Play URLs** - Easier to copy, auto-converted
2. **Set Video Provider** - Select "Bunny Stream" in dropdown
3. **Test After Saving** - View lesson page to verify video displays
4. **Add Duration** - Manually enter video duration in seconds for progress tracking
5. **Publish Lesson** - Video won't show to users until lesson is published

## 🔐 Security & Privacy

- ✅ All videos loaded over HTTPS
- ✅ No external tracking (Bunny respects privacy)
- ✅ GDPR-compliant video hosting
- ✅ Videos can be made private in Bunny dashboard
- ✅ Referer restrictions can be set in Bunny (optional)

## 📱 Responsive Design

Videos automatically adapt to:
- ✅ Desktop screens (full width)
- ✅ Tablets (responsive)
- ✅ Mobile devices (touch-friendly controls)
- ✅ All aspect ratios maintained at 16:9

## 🆚 YouTube vs Bunny

| Feature | YouTube | Bunny Stream |
|---------|---------|--------------|
| **Ads** | May show ads | No ads |
| **Privacy** | Tracks users | Privacy-friendly |
| **Speed** | Good CDN | Excellent CDN |
| **Cost** | Free | Paid (affordable) |
| **Control** | Limited | Full control |
| **Branding** | YouTube branding | Your branding |

## 📚 Additional Resources

- [Bunny Stream Documentation](https://docs.bunny.net/docs/stream)
- [Bunny.net Dashboard](https://dash.bunny.net/)
- [Video Library Setup](https://docs.bunny.net/docs/stream-video-library)

## ✅ Quick Checklist

Before adding a video:
- [ ] Video uploaded to Bunny Stream
- [ ] Video is published in Bunny dashboard
- [ ] Library ID known (visible in URL)
- [ ] Video ID copied (UUID format)
- [ ] Video provider set to "Bunny Stream"
- [ ] URL pasted in Video URL field
- [ ] Duration entered (optional but recommended)
- [ ] Lesson saved and published

## 🎬 Example Full Lesson Setup

```typescript
{
  title: "Introduction to React Hooks",
  slug: "intro-to-react-hooks",
  videoProvider: "bunny",
  videoUrl: "https://iframe.mediadelivery.net/play/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f",
  videoDuration: 600, // 10 minutes in seconds
  description: "Learn the basics of React Hooks",
  content: "<p>In this lesson...</p>",
  isPublished: true,
  isFree: false,
  order: 1
}
```

**Result**: Video automatically displays with proper embed format, responsive sizing, and full Bunny Stream player controls!

## 💡 Pro Tips

1. **Thumbnail Selection**: Set custom thumbnails in Bunny dashboard
2. **Chapter Markers**: Add chapters in Bunny for better UX
3. **Captions**: Upload subtitle files in Bunny dashboard
4. **Analytics**: View watch stats in Bunny dashboard
5. **Quality Settings**: Configure adaptive bitrate in Bunny

---

**Need Help?** Check the troubleshooting section or verify your Bunny dashboard settings.

# Cinematic Hero Video Setup Guide

## Quick Setup Instructions

Your website is now configured for a stunning cinematic hero video featuring nature, cities, desert, and wildlife. Follow these steps to add your video:

---

## Step 1: Get Your Cinematic Nature Video

### Best Free Resources for Stock Videos:

1. **Pexels Videos** (Recommended)
   - URL: https://www.pexels.com/videos/
   - Search for: "nature", "landscape", "city", "desert", "wildlife"
   - Quality: 4K available
   - License: Free to use

2. **Pixabay Videos**
   - URL: https://pixabay.com/videos/
   - Great for: Cinematic nature footage
   - Quality: HD to 4K
   - License: Free

3. **Unsplash Videos**
   - URL: https://unsplash.com/napi/videos/search
   - Quality: High-quality cinematic footage
   - License: Free

4. **Videvo**
   - URL: https://www.videvo.net/
   - Specialty: Stock video effects and transitions
   - License: Free tier available

### Recommended Video Characteristics:
- **Duration**: 15-30 seconds (shorter = faster loading)
- **Resolution**: 1920x1080 (Full HD) or higher
- **Format**: MP4 (main) + WebM (fallback)
- **Content**: Mix of:
  - Sweeping city skylines
  - Desert landscapes with golden hour light
  - Wildlife/Nature scenes
  - Flowing water or wind-blown elements
  - Cinematic transitions between scenes

---

## Step 2: Optimize the Video for Web

### Using Free Tools:

#### Option A: HandBrake (Recommended)
1. Download: https://handbrake.fr/
2. Open your video
3. Settings:
   - Format: MP4 (H.264)
   - Video Codec: H.264
   - Bitrate: 4000-6000 kbps (for quality)
   - Resolution: 1920x1080
   - Frame Rate: 24-30 fps
4. Export and save as `cinematic-hero.mp4`

#### Option B: FFmpeg (Command Line)
```bash
# MP4 Version
ffmpeg -i input-video.mp4 -vcodec libx264 -crf 23 -preset fast -acodec aac -b:a 128k -vf "scale=1920:1080" cinematic-hero.mp4

# WebM Version (fallback)
ffmpeg -i input-video.mp4 -c:v libvpx-vp9 -b:v 4000k -c:a libopus -b:a 128k -vf "scale=1920:1080" cinematic-hero.webm
```

#### Option C: Online Tool
- Use: https://online-convert.com/category/video
- Upload your video, select MP4 format, download

---

## Step 3: Upload Video to Your Website

1. Create a `videos` folder in your website directory:
   ```
   NIFEMI PHOTOGRAPHIC WEBSITE/
   ├── videos/
   │   ├── cinematic-hero.mp4
   │   └── cinematic-hero.webm (optional, for better browser support)
   ├── index.html
   ├── styles.css
   └── script.js
   ```

2. Place your optimized video files in the `videos/` folder

3. Name them exactly:
   - `cinematic-hero.mp4` (required)
   - `cinematic-hero.webm` (optional, for FireFox/Edge optimization)

---

## Step 4: Test Your Video

1. Open your website in a browser
2. The hero section should now display your cinematic video
3. Video will:
   - Auto-play on desktop (muted, required by browsers)
   - Fall back to the image (`dara crop.jpeg`) if video fails to load
   - Scale responsively on mobile devices
   - Show parallax effect when scrolling

---

## Video Performance Tips

### File Size Guidelines:
- **Ideal**: 10-25 MB for 20-30 second video
- **Maximum**: 50 MB (may slow down loading)
- **Target bitrate**: 5000 kbps for good quality/size balance

### Browser Compatibility:
- ✅ Chrome/Edge: MP4 + WebM
- ✅ Safari: MP4 only
- ✅ Firefox: WebM preferred
- ✅ Mobile: MP4 (most compatible)

### Mobile Optimization:
The CSS includes mobile-responsive video sizing:
- Desktop: Full height 100vh
- Tablet: Slightly reduced
- Mobile: 90vh for better button access

---

## Alternative: Use Online Video Service

If you prefer not to self-host video:

1. **YouTube/Vimeo Embed** (Not recommended - slower, ads, limited control)
2. **Cloudinary** (Free tier available)
3. **Bunny CDN** (Cheap video hosting)

---

## Customization Options

### Change Video Content:
Edit `index.html` line ~71-74:
```html
<video class="hero-video" autoplay muted loop playsinline>
  <source src="videos/cinematic-hero.mp4" type="video/mp4">
  <source src="videos/cinematic-hero.webm" type="video/webm">
</video>
```

### Adjust Overlay Darkness:
Edit `styles.css` `.hero-overlay` (line ~310):
```css
.hero-overlay {
  /* Change the rgba values to adjust darkness:
     0-1: opacity (0 = transparent, 1 = opaque)
     Higher = darker overlay
  */
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,     /* Top: lighter */
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.6) 100%    /* Bottom: darker */
  );
}
```

### Change Text/Animations:
- Edit `.cinematic-title` for heading font size
- Edit `.title-word` animation for timing
- Edit `.cinematic-subtitle` for subtitle styling

---

## Troubleshooting

### Video Not Playing?
- Check file path is exactly `videos/cinematic-hero.mp4`
- Ensure video file exists in the `videos/` folder
- Check browser console for errors (F12 → Console tab)

### Video Loads Slowly?
- Reduce file size using compression tips above
- Use WebM format (smaller than MP4)
- Enable gzip compression on your server

### Audio Playing?
- Video is set to `muted` attribute - this is required for autoplay
- If you want sound, use a user gesture (click button)

### Fallback Image Shows?
- This is intentional - if video fails, image appears
- Good for reliability and older browsers

---

## Recommended Video Themes

For a photography portfolio:
1. **Cinematic Nature Loop**: Mountains → Cities → Desert → Wildlife
2. **Urban Exploration**: City lights → Street photography → Architecture
3. **Travel Montage**: Landscapes of different locations
4. **Golden Hour**: Sunset/sunrise footage with natural transitions

---

## Next Steps

1. ✅ Download a video from free stock sites
2. ✅ Optimize using HandBrake or FFmpeg
3. ✅ Create `videos/` folder
4. ✅ Upload files: `cinematic-hero.mp4` + `cinematic-hero.webm`
5. ✅ Test in browser
6. ✅ Customize overlay/text as needed

Your cinematic hero section is ready to blow your audience away! 🎬✨

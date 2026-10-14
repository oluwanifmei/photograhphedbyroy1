# 🎬 Quick Reference Card

## Your Cinematic Hero - Quick Setup Guide

### 📌 The 3-Minute Overview

**What You Got:**
- ✅ Full-screen video hero section (ready to use)
- ✅ Cinematic animations (word-by-word title cascade)
- ✅ Responsive design (works on all devices)
- ✅ Professional styling (gold accents, dark theme)
- ✅ Smooth parallax scroll effect
- ✅ Fallback image (if video fails)

**What You Need To Do:**
1. Download a video (5 minutes)
2. Optimize it (optional, 5 minutes)
3. Upload to `videos/` folder (2 minutes)
4. Done! ✨

---

## 🚀 The Quick Start (Copy-Paste Instructions)

### Step 1: Get Video
```
1. Go to: https://www.pexels.com/videos/
2. Search: "cinematic landscape"
3. Click download (1920x1080, MP4)
4. Save anywhere on your computer
```

### Step 2: Optimize (Skip if in a hurry)
```
1. Download: https://handbrake.fr/
2. Install and open
3. Drag your video into it
4. Settings: 5000 kbps bitrate, 1920x1080, H.264
5. Click "Start Encode"
6. Wait 5-10 minutes
```

### Step 3: Upload
```
1. Find folder: NIFEMI PHOTOGRAPHIC WEBSITE/videos/
2. Paste optimized video file
3. Rename to: cinematic-hero.mp4
4. Open index.html in browser
5. Celebrate! 🎉
```

---

## 🎯 File Paths Reference

```
Your video goes here:
c:\Users\user\Pictures\NIFEMI PHOTOGRAPHIC WEBSITE\videos\cinematic-hero.mp4

Website file to check:
c:\Users\user\Pictures\NIFEMI PHOTOGRAPHIC WEBSITE\index.html
```

---

## 🎨 Colors (For Customization)

| Element | Color | Hex Code |
|---------|-------|----------|
| Text | Light Blue | #f4f7ff |
| Accent | Gold | #dbb389 |
| Strong Gold | Bright Gold | #f4c37c |
| Background | Dark | #080b13 |
| Overlay | Dark with Alpha | rgba(0,0,0,0.6) |

---

## 📱 What Works Where

| Device | Status | Height |
|--------|--------|--------|
| Desktop (1920px+) | ✅ Optimal | 100vh |
| Tablet (900px+) | ✅ Great | 100vh |
| Mobile (680px+) | ✅ Perfect | 90vh |
| Small Mobile | ✅ Works | 90vh |

---

## ⚙️ Key Settings

### Video Settings (in HTML)
```html
<video class="hero-video" autoplay muted loop playsinline>
```
- **autoplay** = starts playing on load
- **muted** = required for autoplay (browsers)
- **loop** = plays continuously
- **playsinline** = plays on mobile

### Video Codec (for compression)
- **Video**: H.264 (VP9 alternative for WebM)
- **Audio**: AAC (128 kbps)
- **Bitrate**: 5000 kbps

---

## 📊 File Size Guidelines

| Quality | Bitrate | Size | Load Time |
|---------|---------|------|-----------|
| HD | 3000 kbps | 7 MB | 2 sec |
| FHD | 5000 kbps | 12 MB | 3 sec |
| High | 7000 kbps | 18 MB | 4 sec |
| Very High | 10000 kbps | 25 MB | 5 sec |

**Recommended**: 5000 kbps (12 MB, 3 seconds)

---

## ✨ Animation Timings

| Element | Duration | Start Time |
|---------|----------|-----------|
| Eyebrow | 0.8s | 0s |
| Title Word 1 | 0.8s | 0.1s |
| Title Word 2 | 0.8s | 0.2s |
| Title Word 3 | 0.8s | 0.3s |
| Title Word 4 | 0.8s | 0.4s |
| Subtitle | 1s | 0.5s |
| Buttons | 1s | 0.7s |
| Scroll Arrow | inf | 0.9s |

---

## 🔧 Quick Customization

### Change Title Text
File: `index.html` Line 85
```html
<h1 class="cinematic-title">
  <span class="title-word">YOUR TEXT</span>
```

### Change Button Text
File: `index.html` Line 94-95
```html
<a href="#" data-page="gallery">YOUR TEXT</a>
```

### Change Overlay Darkness
File: `styles.css` Line 309
```css
rgba(0, 0, 0, 0.2) /* Make darker: 0.4, lighter: 0.1 */
```

### Change Title Size
File: `styles.css` Line 340
```css
font-size: clamp(2.8rem, 6vw, 5.5rem);
/* Change first (2.8rem) to make smaller on mobile */
/* Change last (5.5rem) to make larger on desktop */
```

---

## 🎬 Recommended Videos

### Best Themes
- [ ] Mountain landscape with cinematic pans
- [ ] City skyline with golden hour lighting
- [ ] Desert sunset with dramatic sky
- [ ] Wildlife/nature close-ups
- [ ] Water flows (rivers, ocean waves)
- [ ] Urban/street photography scenes
- [ ] Forest/nature montage
- [ ] Travel/exploration footage

### Content Mix Suggestion
- 40% Nature/Landscape
- 30% Urban/City scenes
- 20% Wildlife/Macro
- 10% Abstract/Artistic

---

## 🌐 Best Stock Video Sites (in order)

1. **Pexels Videos** (⭐⭐⭐⭐⭐ Recommended)
   - Free, High quality, 4K available
   - https://www.pexels.com/videos/

2. **Pixabay Videos** (⭐⭐⭐⭐⭐)
   - Free, Good variety
   - https://pixabay.com/videos/

3. **Unsplash Videos** (⭐⭐⭐⭐)
   - Free, Curated selection
   - https://unsplash.com/napi/videos/

4. **Videvo** (⭐⭐⭐⭐)
   - Free + Premium
   - https://www.videvo.net/

---

## 🐛 Troubleshooting Checklist

### Video Not Showing
- [ ] File is in `videos/` folder
- [ ] File is named exactly: `cinematic-hero.mp4`
- [ ] File format is MP4
- [ ] File isn't corrupted (try opening in VLC)
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Check browser console (F12)

### Video Plays But Slowly
- [ ] Reduce file size (HandBrake)
- [ ] Reduce bitrate to 4000 kbps
- [ ] Try 1920x1080 resolution
- [ ] Check internet speed
- [ ] Use WebM format (smaller)

### Text Not Visible
- [ ] Overlay is too dark (adjust rgba)
- [ ] Video is very bright (use darker overlay)
- [ ] Text color is wrong (check CSS)
- [ ] Font is too small (zoom out, check mobile)

### Animations Not Smooth
- [ ] Close other browser tabs
- [ ] Update browser (Chrome, Safari, Firefox)
- [ ] Check GPU acceleration enabled
- [ ] Hardware is slow (expected on older devices)

---

## ✅ Pre-Launch Checklist

- [ ] Video downloaded
- [ ] Video optimized (optional but recommended)
- [ ] Video placed in `videos/` folder
- [ ] Video named `cinematic-hero.mp4`
- [ ] Website opens without errors
- [ ] Hero video plays
- [ ] Text animations work
- [ ] Buttons are clickable
- [ ] Tested on mobile
- [ ] Tested on desktop
- [ ] Tested in different browser
- [ ] All links work
- [ ] Contact form works
- [ ] No console errors

---

## 💡 Pro Tips

1. **Video Quality**: 1920x1080 MP4 at 5000 kbps is sweet spot
2. **Timing**: 20-30 second video loops well
3. **Color Grading**: Warm (golden) tones match theme
4. **Content**: Mix of different scenes works best
5. **Fallback**: Image shows if video fails (so it's safe!)
6. **Performance**: CSS animations use native speed (no lag)
7. **Mobile**: Video still plays smoothly on phones
8. **Updates**: Easy to swap video anytime

---

## 📞 Quick Help

**Problem**: Video not loading
**Solution**: Check file path and name are exact

**Problem**: Text hard to read
**Solution**: Make overlay darker (increase rgba first number)

**Problem**: Slow to load
**Solution**: Reduce file size with HandBrake to 10-15 MB

**Problem**: Buttons not clickable
**Solution**: Make sure video isn't covering them (adjust height)

---

## 🎬 Final Checklist

```
[ ] Download video
[ ] Optimize video (optional)
[ ] Create videos/ folder (if missing)
[ ] Copy video to videos/ folder
[ ] Rename to cinematic-hero.mp4
[ ] Open index.html in browser
[ ] See your cinematic hero! 🎉
```

---

## 📖 Documentation Files to Read

In this order:
1. **README.md** - Overview (2 min read)
2. **VIDEO_SETUP_GUIDE.md** - Video instructions (5 min read)
3. **IMPLEMENTATION_CHECKLIST.md** - Detailed steps (3 min read)
4. **VISUAL_PREVIEW.md** - See what it looks like (2 min read)
5. **CINEMATIC_HERO_SUMMARY.md** - Deep dive (5 min read)

---

## 🚀 You're All Set!

Everything is ready. You have:
- ✅ Cinematic hero section (built)
- ✅ Responsive design (tested)
- ✅ Smooth animations (optimized)
- ✅ Video fallback (reliable)
- ✅ Complete documentation (clear)

**Now just add your video and launch!** 🚀📸✨

---

**Questions?** Check the documentation files - they have detailed answers!

**Good luck!** Your photography website is about to be stunning! 🎬

For the corrected server, authentication, booking flows, and production storage settings, follow [TECHNICAL_SETUP.md](TECHNICAL_SETUP.md).

The current website uses an editorial photo hero, responsive galleries, photo stories,
client spotlights, guest booking, and a protected owner dashboard. Run it with the
Express server (`npm install`, configure `.env`, then `npm start`) for the
booking/account APIs. GitHub Pages builds every public page with `npm run
build:pages` and supports booking enquiries through WhatsApp without a server.
The video-hero instructions below describe the earlier design and are retained as
historical reference; a hero video is no longer required.

# 🎬 PHOTOGRAPHED BY ROY - Cinematic Hero Edition

A stunning, responsive photography portfolio website with a **cinematic video hero section**, dark/light theme switching, and professional animations.

## ✨ What's New

### Cinematic Hero Section
- 🎬 Full-screen video background (100vh on desktop)
- ✨ Animated title with word-by-word cascade effect
- 📱 Fully responsive (mobile-optimized)
- 🎨 Gradient overlay with text for readability
- 💫 Smooth parallax scroll effect
- ⚡ Video fallback to image if needed
- 🌟 Glow effect on buttons

See **VIDEO_SETUP_GUIDE.md** for complete video setup instructions.

## 📦 What is included

- `index.html` — **NEW:** Cinematic video hero + gallery, about, and contact sections
- `styles.css` — Modern dark theme with cinematic animations (~300 new lines)
- `script.js` — Parallax scroll, video handling, and navigation
- `videos/` — Folder for your cinematic hero video (create your own!)
- `images/placeholder.svg` — Placeholder image for gallery
- **NEW:** `VIDEO_SETUP_GUIDE.md` — Complete video setup instructions
- **NEW:** `CINEMATIC_HERO_SUMMARY.md` — Implementation overview
- **NEW:** `IMPLEMENTATION_CHECKLIST.md` — Step-by-step checklist

## 🚀 Getting Started

### Quick Start (3 Steps)

#### 1. Get Your Video
```
Visit: https://www.pexels.com/videos/
Search: "cinematic landscape nature"
Download: 1920x1080 MP4 format
```

#### 2. Optimize (Optional)
```
Download HandBrake: https://handbrake.fr/
Open video → Export at 5000 kbps
Save as: cinematic-hero.mp4
```

#### 3. Upload
```
Place: cinematic-hero.mp4
Into: videos/ folder
Open: index.html in browser ✅
```

### Detailed Instructions

For complete setup with optimization tips, see **VIDEO_SETUP_GUIDE.md**

## 🎨 Features

### Hero Section
- ✅ Full-screen video background
- ✅ Cinematic gradient overlay
- ✅ Animated text elements
- ✅ Call-to-action buttons with glow
- ✅ Scroll indicator
- ✅ Fallback image support

### Responsive Design
- ✅ Desktop: 100vh full-screen
- ✅ Tablet: Optimized layout
- ✅ Mobile: Vertical buttons, adjusted text sizes
- ✅ All animations work on all devices

### Video Optimization
- ✅ Auto-plays (muted)
- ✅ Loops seamlessly
- ✅ Fallback to image if needed
- ✅ MP4 + WebM support
- ✅ 5-second timeout for reliability

### Additional Features
- ✅ Dark/light theme toggle
- ✅ Mobile menu navigation
- ✅ Parallax scroll effects
- ✅ Smooth transitions
- ✅ Interactive chatbot
- ✅ Gallery with filters
- ✅ Before & after slider
- ✅ Booking form with WhatsApp integration

## 📖 Documentation

### VIDEO_SETUP_GUIDE.md
Complete guide for:
- Finding free stock videos
- Optimizing video file size
- Video formats and specs
- Upload instructions
- Troubleshooting

### CINEMATIC_HERO_SUMMARY.md
Implementation overview:
- Features implemented
- Files modified
- Design specifications
- Customization options
- Animation timing

### IMPLEMENTATION_CHECKLIST.md
Step-by-step guide:
- What's been done
- What you need to do
- Testing checklist
- Performance targets
- Advanced options

## 🎬 Video Recommendations

### Best Sources
- **Pexels Videos** (Recommended) - https://www.pexels.com/videos/
- **Pixabay Videos** - https://pixabay.com/videos/
- **Unsplash Videos** - https://unsplash.com/napi/videos
- **Videvo** - https://www.videvo.net/

### Video Specs
- **Duration**: 20-30 seconds
- **Resolution**: 1920x1080 (Full HD)
- **Format**: MP4 (H.264)
- **Bitrate**: 5000 kbps
- **File Size**: 10-25 MB
- **Content**: Nature, cities, desert, wildlife

## 🎨 Customization

### Change Hero Text
Edit `index.html` lines 84-95:
```html
<p class="eyebrow-cinema">YOUR TEXT</p>
<h1 class="cinematic-title">...</h1>
<p class="cinematic-subtitle">YOUR TEXT</p>
```

### Change Button Text
Edit `index.html` lines 94-95:
```html
<a class="button button-primary glow-effect" href="#" data-page="gallery">YOUR TEXT</a>
<a class="button button-secondary" href="#" data-page="booking">YOUR TEXT</a>
```

### Change Colors
Edit `styles.css` variables in `:root` section:
```css
--accent: #dbb389;              /* Gold accent color */
--text: #f4f7ff;                /* Text color */
```

### Adjust Overlay Darkness
Edit `styles.css` `.hero-overlay`:
```css
rgba(0, 0, 0, 0.2) → rgba(0, 0, 0, 0.4)   /* Darker overlay */
```

## 📝 Updating Content

1. **Replace gallery images**: Add your photos to `images/` folder
2. **Update text**: Edit copy in `index.html`
3. **Customize hero video**: Upload your video to `videos/` folder
4. **Update contact details**: Edit WhatsApp number and email
5. **Change colors**: Modify CSS variables in `:root`

## 🧪 Testing

### Desktop
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile

### Devices
- [ ] Large desktop (1920px+)
- [ ] Tablet (768px-1024px)
- [ ] Mobile (320px-480px)

## ⚡ Performance

### Load Times
- **First Paint**: < 1 second
- **Video Start**: < 2 seconds
- **Full Load**: < 3 seconds

### File Sizes
- `index.html`: ~30 KB
- `styles.css`: ~34 KB
- `script.js`: ~19 KB
- `cinematic-hero.mp4`: 10-25 MB (you provide)

## 🚀 Deployment

### Free Hosting Options
- **GitHub Pages**: Push to GitHub, enable Pages in settings
- **Netlify**: Drag and drop folder
- **Vercel**: Connect GitHub repo
- **Firebase**: Google's free hosting
- **Cloudflare Pages**: Fast CDN hosting

### With Video Optimization
- Compress video to 10-25 MB
- Use WebM format for smaller file size
- Consider CDN for video delivery
- Enable gzip compression on server

## 🐛 Troubleshooting

### Video not showing
1. Check file path: `videos/cinematic-hero.mp4`
2. Verify file exists
3. Hard refresh: `Ctrl+Shift+R`
4. Check browser console: `F12`

### Slow video loading
1. Reduce file size with HandBrake
2. Use WebM format (smaller)
3. Compress to 4000-5000 kbps bitrate
4. Aim for < 25 MB total

### Text/buttons not visible
1. Adjust overlay darkness in CSS
2. Ensure video is loading
3. Check color contrast
4. Test in different browser

## 🎯 Optional Enhancements

- ✅ Add more gallery photos
- ✅ Customize all text and branding
- ✅ Deploy to your own domain
- ✅ Add form backend (Formspree, etc.)
- ✅ Add Google Analytics
- ✅ Add custom domain email
- ✅ Create WebM video format
- ✅ Add metadata/SEO tags

## 📞 Getting Help

### First Time?
1. Read **VIDEO_SETUP_GUIDE.md**
2. Follow the 3-step quick start
3. Test in browser

### Stuck?
1. Check **IMPLEMENTATION_CHECKLIST.md**
2. Open browser console (`F12`)
3. Look for error messages
4. Try troubleshooting section

## 📋 Checklist for Launch

- [ ] Video downloaded and optimized
- [ ] `cinematic-hero.mp4` placed in `videos/` folder
- [ ] Hero text customized with your copy
- [ ] Gallery photos uploaded
- [ ] Contact details updated
- [ ] Colors/branding customized
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Deployed to hosting service
- [ ] Domain connected (optional)

## 📄 License & Credits

- Built with HTML5, CSS3, JavaScript
- Uses responsive design principles
- Dark/light theme support included
- Video background concept from modern web design trends

## 🎉 You're All Set!

Your photography portfolio now has:
- ✨ A stunning cinematic hero
- 📱 Full mobile responsiveness
- ⚡ Optimized performance
- 🎨 Professional design
- 🚀 Easy to customize

Get that video uploaded and start impressing your audience! 🎬📸

---

*Last Updated: 2026*  
*Status: Production Ready*  
*Version: Cinematic Edition*

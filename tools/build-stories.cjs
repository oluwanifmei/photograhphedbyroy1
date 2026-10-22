const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'photo-stories.json'), 'utf8'));
const manifestPath = path.join(root, 'images/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const alt = source => ({
  'DARA.jpeg': 'A woman in glasses and a yellow blouse against blue and gold',
  'My%20webproject/C91E4D5E-6317-4AA4-A488-52519999466A_0D74C73E-1919-4D69-A590-583913595ABC.jpg': 'A closer portrait in warm yellow tones',
  'My%20webproject/IMG_4662.JPG': 'A portrait beside a busy city road',
  'My%20webproject/IMG_4663.JPG': 'A man holding a teddy bear beside passing traffic',
  'My%20webproject/IMG_4665.JPG': 'A portrait at a city crossing',
  'My%20webproject/IMG_4670.JPG': 'A portrait beside a roadside sign',
  'My%20webproject/IMG_1094.jpg': 'Saxophonist under purple stage lighting',
  'My%20webproject/IMG_1120.jpg': 'Saxophone player under blue stage lighting',
  'My%20webproject/IMG_1130.jpg': 'Live performers beneath purple stage lights',
  'My%20webproject/IMG_2768.jpg': 'Roy holding a camera gimbal during an outdoor shoot',
  'My%20webproject/IMG_2770.jpg': 'A second angle of Roy working with a camera gimbal',
  'IMG_7474.JPG.jpeg': 'Portrait of a woman wearing glasses beside a window',
  'IMG_7125.JPG.jpeg': 'Full-length fashion portrait in burgundy trousers',
  'My%20webproject/IMG_9596.jpg': 'Young girl in a red dress photographed outdoors'
}[source] || 'Photography by Roy');
async function ensure(source) {
  if (manifest[source]) return;
  const name = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
  const variants = [];
  let dimensions;
  for (const width of [480, 960, 1600]) {
    const src = `images/${name}-${width}.webp`;
    const info = await sharp(path.join(root, decodeURIComponent(source))).rotate().resize({ width }).webp({ quality: 80 }).toFile(path.join(root, src));
    variants.push({ width, src });
    if (width === 960) dimensions = { width: info.width, height: info.height };
  }
  manifest[source] = { ...dimensions, variants, src: variants[1].src, full: variants[2].src, srcset: variants.map(image => `${image.src} ${image.width}w`).join(', ') };
}
function image(source, sizes = '(max-width: 760px) 92vw, 45vw') {
  const file = manifest[source];
  return `<img src="${file.src}" srcset="${file.srcset}" sizes="${sizes}" width="${file.width}" height="${file.height}" alt="${escape(alt(source))}" loading="lazy" decoding="async" />`;
}
const storyCard = story => `<a class="story-cover" href="/stories#${story.id}"><div class="story-cover-image">${image(story.cover, '(max-width: 760px) 92vw, 30vw')}<span class="story-number">${story.number} / PHOTO STORY</span><span class="story-open" aria-hidden="true">↗</span></div><div class="story-cover-copy"><p class="eyebrow">${escape(story.category)}</p><h3>${escape(story.title)}</h3><p>${escape(story.intro)}</p><span class="story-read">Step inside the story <span aria-hidden="true">→</span></span></div></a>`;
const chapter = story => `<article class="story-chapter" id="${story.id}"><header class="story-chapter-heading"><span class="chapter-number">${story.number}</span><div><p class="eyebrow">${escape(story.category)}</p><h2>${escape(story.title)}</h2><p class="story-deck">${escape(story.intro)}</p></div></header><div class="story-photo-sequence">${story.photos.map((photo, i) => `<figure>${image(photo)}<figcaption><span>FRAME ${String(i + 1).padStart(2, '0')}</span><span>PHOTOGRAPHED BY ROY</span></figcaption></figure>`).join('')}</div><div class="story-afterword"><div><p class="eyebrow">A CLOSER LOOK</p><p>${escape(story.note)}</p><ul class="story-tags">${story.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul></div><a class="hero-text-link" href="/book?package=${story.package}">Create your own story ↗</a></div></article>`;
(async () => {
  const diary = ['My%20webproject/IMG_2768.jpg', 'My%20webproject/IMG_2770.jpg'];
  const spotlights = [
    { photo: 'IMG_7474.JPG.jpeg', label: 'Portrait spotlight', title: 'In your own light.', text: 'Soft window light, an easy gesture, and the personality at the centre of the frame.', category: 'portraits' },
    { photo: 'IMG_7125.JPG.jpeg', label: 'Fashion spotlight', title: 'A little quiet confidence.', text: 'Clean lines and a bold hit of burgundy give this full-length portrait its character.', category: 'fashion' },
    { photo: 'My%20webproject/IMG_9596.jpg', label: 'Portrait spotlight', title: 'Let the colour speak.', text: 'A red dress and a bright outdoor setting turn a simple portrait into a vivid frame.', category: 'portraits' }
  ];
  const sources = new Set([...config.stories.flatMap(story => [story.cover, ...story.photos]), ...diary, ...spotlights.map(item => item.photo)]);
  for (const source of sources) await ensure(source);
  const featured = `<section class="photo-stories-section" id="photo-stories"><div class="container"><div class="work-heading"><div><p class="eyebrow">NOT JUST A PHOTOGRAPH</p><h2>Every frame has<br><em>something to say.</em></h2></div><a class="hero-text-link" href="/stories">Explore the stories ↗</a></div><p class="stories-intro">A little colour. A little movement. A closer look at the photographs and the details that make them feel alive.</p><div class="story-cover-grid">${config.stories.map(storyCard).join('')}</div></div></section>`;
  const spotlightSection = `<section class="client-spotlights" id="client-spotlights"><div class="container"><div class="work-heading"><div><p class="eyebrow">CLIENT SPOTLIGHTS</p><h2>Different people.<br><em>Something unmistakably theirs.</em></h2></div><a class="hero-text-link" href="/book">Your story could be next ↗</a></div><div class="spotlight-grid">${spotlights.map(item => `<article class="spotlight-card"><a href="/portfolio?category=${item.category}" aria-label="Explore ${escape(item.label.toLowerCase())} photographs">${image(item.photo, '(max-width: 760px) 92vw, 30vw')}</a><p class="eyebrow">${item.label}</p><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div></div></section>`;
  let footage = '';
  if (config.behindTheScenesVideo) {
    const file = config.behindTheScenesVideo;
    if (!/^videos\/[a-zA-Z0-9_-]+\.(mp4|webm)$/.test(file) || !fs.existsSync(path.join(root, file))) throw new Error('Behind-the-scenes footage must be an existing MP4 or WebM in videos/.');
    footage = `<video controls playsinline preload="none" poster="${manifest[diary[0]].src}"><source src="${file}" type="video/${file.endsWith('.webm') ? 'webm' : 'mp4'}" />Your browser does not support this video.</video>`;
  }
  const behind = `<!-- BEHIND_THE_SCENES_START --><section class="behind-the-lens" id="behind-the-lens"><div class="container behind-layout"><div class="behind-copy"><p class="eyebrow">BEHIND THE LENS / ON SET</p><h2>Before the frame,<br><em>there's the feeling.</em></h2><p>A camera, a gimbal, and a different way of seeing. A small look at Roy working on location, on the other side of the photograph.</p><div class="behind-facts"><span>ON LOCATION</span><span>CAMERA IN HAND</span><span>ROY AT WORK</span></div><a class="hero-text-link" href="/contact">Let's create something ↗</a></div><div class="behind-media">${footage || `<div class="behind-photo-diary">${diary.map((photo, i) => `<figure data-diary-frame="${i}"${i ? ' hidden' : ''}>${image(photo, '(max-width: 760px) 92vw, 52vw')}<figcaption>ON SET · CAMERA GIMBAL · FRAME ${i + 1} / ${diary.length}</figcaption></figure>`).join('')}</div><div class="diary-controls" role="group" aria-label="Behind-the-scenes photo diary">${diary.map((_, i) => `<button type="button" data-diary-select="${i}" aria-pressed="${i === 0}" aria-label="Show behind-the-scenes photo ${i + 1}">${String(i + 1).padStart(2, '0')}</button>`).join('')}<span>PHOTO DIARY</span></div>`}</div></div></section><!-- BEHIND_THE_SCENES_END -->`;
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  html = html.replace(/<section class="(?:featured-story|photo-stories-section)"[^>]*>[\s\S]*?<\/section>/, featured);
  if (html.includes('<section class="client-spotlights"')) html = html.replace(/<section class="client-spotlights"[^>]*>[\s\S]*?<\/section>/, spotlightSection);
  else html = html.replace('<section class="testimonial-section">', spotlightSection + '\n<section class="testimonial-section">');
  if (html.includes('<!-- BEHIND_THE_SCENES_START -->')) html = html.replace(/<!-- BEHIND_THE_SCENES_START -->[\s\S]*?<!-- BEHIND_THE_SCENES_END -->/, behind);
  else html = html.replace('<section class="process-section"', behind + '\n<section class="process-section"');
  const blogStart = html.indexOf('<section id="page-blog"');
  const blogEnd = html.indexOf('<!-- BOOKING PAGE -->', blogStart);
  const storiesPage = `<section id="page-blog" class="page"><div class="page-header"><div class="container section-header"><p class="eyebrow">THE STORY EDIT</p><h2>More than a moment.</h2><p>Portrait studies, city notes and the energy of live performance. Step inside the photographs.</p></div></div><div class="container story-index"><span>CHOOSE A CHAPTER</span>${config.stories.map(story => `<a href="#${story.id}">${story.number} · ${escape(story.title)}</a>`).join('')}</div><div class="container story-chapters">${config.stories.map(chapter).join('')}</div><div class="container story-final"><p class="eyebrow">THE NEXT STORY IS YOURS</p><h2>Let's make it personal.</h2><a class="button button-primary" href="/book">Plan your session →</a></div></section>\n\n`;
  html = html.slice(0, blogStart) + storiesPage + html.slice(blogEnd);
  html = html.replace('data-page="blog">Blog</a>', 'data-page="blog">Stories</a>');
  if (!html.includes('src="stories.js"')) html = html.replace('<script src="portfolio.js"></script>', '<script src="portfolio.js"></script>\n  <script src="stories.js"></script>');
  fs.writeFileSync(path.join(root, 'index.html'), html);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Built 3 photo stories, 3 client spotlights, and the on-set media section.');
})().catch(error => { console.error(error); process.exitCode = 1; });

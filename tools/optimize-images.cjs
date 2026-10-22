// Run after adding original photographs: node tools/optimize-images.cjs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'images');
fs.mkdirSync(output, { recursive: true });
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const literal = script.match(/const galleryData = (\[[\s\S]*?\n\]);/)[1];
const gallery = vm.runInNewContext(literal);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const manifest = {};
let originalBytes = 0, optimizedBytes = 0;
async function optimize(source, name) {
  if (manifest[source]) return manifest[source];
  const file = path.join(root, decodeURIComponent(source));
  const meta = await sharp(file).rotate().metadata();
  const imageName = name || crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
  const widths = [480, 960, 1600];
  const variants = [];
  let dimensions;
  for (const width of widths) {
    const target = `images/${imageName}-${width}.webp`;
    const info = await sharp(file).rotate().resize({ width }).webp({ quality: 80, effort: 5 }).toFile(path.join(root, target));
    optimizedBytes += info.size;
    if (width === 960) dimensions = { width: info.width, height: info.height };
    variants.push({ width, src: target });
  }
  originalBytes += fs.statSync(file).size;
  const result = { ...dimensions, variants, src: variants[1].src, full: variants[2].src, srcset: variants.map(v => `${v.src} ${v.width}w`).join(', ') };
  manifest[source] = result;
  return result;
}
const card = (photo, image) => `<figure class="portfolio-card" data-category="${escape(photo.category)}"><button type="button" class="portfolio-open" data-full="${image.full}" data-title="${escape(photo.title)}" aria-label="View ${escape(photo.title)}"><img src="${image.src}" srcset="${image.srcset}" sizes="(max-width: 760px) 46vw, (max-width: 960px) 48vw, 32vw" width="${image.width}" height="${image.height}" alt="${escape(photo.alt)}" loading="lazy" decoding="async" /></button><figcaption><span>${escape(photo.title)}</span><small>${escape(photo.category)}</small></figcaption></figure>`;
(async () => {
  await optimize('DARA.jpeg', 'hero');
  for (const photo of gallery) await optimize(photo.src);
  const featured = [
    { src: 'IMG_8510.JPG.jpeg', category: 'portraits', title: 'A little blue, a little sunshine', alt: 'Woman in a light blue outfit standing in a green garden' },
    { src: 'IMG_7125.JPG.jpeg', category: 'fashion', title: 'An everyday kind of confidence', alt: 'Man in a dark shirt and burgundy trousers photographed outdoors' },
    { src: 'IMG_7474.JPG.jpeg', category: 'portraits', title: 'In your own light', alt: 'Woman wearing glasses seated beside a window' }
  ];
  for (const photo of featured) await optimize(photo.src);
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  html = html.replace(/(<div class="gallery-grid" id="galleryGrid">)[\s\S]*?(<\/div>)/, '$1' + gallery.map(photo => card(photo, manifest[photo.src])).join('\n') + '$2');
  html = html.replace(/(<div class="selected-grid" id="selectedWork">)[\s\S]*?(<\/div>)/, '$1' + featured.map(photo => card(photo, manifest[photo.src]).replace('46vw', '100vw')).join('\n') + '$2');
  // Optimise static editorial, blog, and about photographs as well.
  const sources = [...html.matchAll(/<img [^>]*src="([^"]+)"[^>]*>/g)].map(match => match[1]);
  for (const source of new Set(sources)) {
    if (source.startsWith('images/') || source.startsWith('data:')) continue;
    const image = await optimize(source);
    html = html.replaceAll(`src="${source}"`, `src="${image.src}" srcset="${image.srcset}" sizes="(max-width: 760px) 100vw, 50vw" width="${image.width}" height="${image.height}"`);
  }
  fs.writeFileSync(path.join(root, 'index.html'), html);
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ photographs: Object.keys(manifest).length, originalBytes, optimizedBytes }));
})().catch(error => { console.error(error); process.exitCode = 1; });

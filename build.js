#!/usr/bin/env node
/**
 * Mile High Athletics — build.js
 * Zero-dependency static site build.
 *
 *   node build.js          → renders content/*.json through templates/
 *                            into dist/ and copies all static assets.
 *
 * Netlify runs this automatically on every publish from the CMS
 * (build command: "node build.js", publish directory: "dist").
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const { render } = require('./templates/index.template.js');

/* ── load content ─────────────────────────────────────── */

function loadJson(name) {
  const file = path.join(ROOT, 'content', name + '.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`✖ Could not read content/${name}.json — ${err.message}`);
    process.exit(1);
  }
}

const content = {
  site: loadJson('site'),
  seo: loadJson('seo'),
  hero: loadJson('hero'),
  about: loadJson('about'),
  services: loadJson('services'),
  reviews: loadJson('reviews'),
  recovery: loadJson('recovery'),
  booking: loadJson('booking')
};

/* ── light validation (protects the layout) ───────────── */

const problems = [];
function check(cond, msg) { if (!cond) problems.push(msg); }

check(content.seo.page_title && content.seo.page_title.length <= 70,
  'SEO page title is missing or longer than 70 characters');
check(content.seo.meta_description && content.seo.meta_description.length <= 170,
  'SEO meta description is missing or longer than 170 characters');
check((content.services.programs || []).filter(p => p.visible !== false).length >= 1,
  'At least one visible training program is required');
check((content.services.programs || []).length <= 6,
  'No more than 6 training programs (layout limit)');
check((content.reviews.reviews || []).length <= 9,
  'No more than 9 reviews (layout limit)');
check((content.hero.stats || []).length >= 1 && (content.hero.stats || []).length <= 4,
  'Hero stats must have between 1 and 4 items');
check(/^https:\/\/(www\.)?vagaro\.com\//.test(content.booking.scheduler_url),
  'Booking scheduler URL must be a vagaro.com link');
(content.services.programs || []).forEach(p => {
  check((p.featured_badge || '').length <= 20, `Featured badge for "${p.name}" longer than 20 chars`);
});

if (problems.length) {
  console.error('✖ Content validation failed:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}

/* ── render ───────────────────────────────────────────── */

try {
  fs.rmSync(DIST, { recursive: true, force: true });
} catch (e) {
  console.warn('⚠ could not fully clear dist/ — overwriting in place (' + e.code + ')');
}
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), render(content), 'utf8');
console.log('✔ dist/index.html rendered');

/* ── copy static assets ───────────────────────────────── */

const COPY_FILES = [
  'style.css',
  'main.js',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  '_redirects',
  'logo-color.png',
  'logo-dark.png',
  'logo-white-transparent.png',
  'ty-hero-large.jpg'
];

const COPY_DIRS = [
  'images',
  'admin'
];

/* copyFileSync with a portable fallback (some filesystems don't
   support the copyfile syscall) */
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (e) {
    try {
      fs.writeFileSync(dest, fs.readFileSync(src));
    } catch (e2) {
      console.warn(`⚠ could not copy ${path.relative(ROOT, src)} (${e2.code || e2.message}) — skipped`);
    }
  }
}

/* Legacy files kept in the repo for reference but not shipped */
const SKIP_LEGACY = new Set([
  'airvida-hyperbaric-chamber.jpeg',      // superseded by -800 variant
  'airvida-hyperbaric-chamber-1200.jpeg', // superseded by -800 variant
  'hbot-benefits.png',                    // superseded by hbot-benefits.jpg
  'hbot-benefits-opt.png'                 // superseded by hbot-benefits.jpg
]);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store' || entry.name === '.gitkeep') continue;
    if (SKIP_LEGACY.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

for (const f of COPY_FILES) {
  const src = path.join(ROOT, f);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ skipped missing file: ${f}`);
    continue;
  }
  copyFile(src, path.join(DIST, f));
}

for (const dir of COPY_DIRS) {
  const src = path.join(ROOT, dir);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ skipped missing folder: ${dir}`);
    continue;
  }
  copyDir(src, path.join(DIST, dir));
}

console.log('✔ static assets copied');
console.log('✔ Build complete → dist/');

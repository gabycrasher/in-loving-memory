import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readOptional(path) {
  try {
    return await readFile(new URL(path, root), "utf8");
  } catch {
    return "";
  }
}

test("the memorial site contains the complete tribute", async () => {
  const html = await readOptional("index.html");

  assert.match(html, /A Beautiful Life/i);
  assert.match(html, /great friend/i);
  assert.match(html, /mentor/i);
  assert.match(html, /man of faith/i);
  assert.match(html, /loving father and husband/i);
  assert.match(html, /smile/i);
  assert.match(html, /birthday/i);
  assert.match(html, /in loving memory/i);
});

test("all twenty-four supplied photographs are preserved and used", async () => {
  let photos = [];
  try {
    photos = (await readdir(new URL("assets/photos/", root))).filter((name) => /\.jpe?g$/i.test(name));
  } catch {
    photos = [];
  }

  assert.equal(photos.length, 24);

  const html = await readOptional("index.html");
  const references = new Set(html.match(/assets\/photos\/memory-\d{2}\.jpg/g) ?? []);
  assert.equal(references.size, 24);
});

test("the page includes accessible interactive memorial features", async () => {
  const html = await readOptional("index.html");
  const script = await readOptional("app.js");

  assert.match(html, /meta name="viewport"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="story-toggle"/);
  assert.match(html, /id="light-candle"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /rel="icon" href="favicon\.svg"/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /openLightbox/);
  assert.match(script, /lightCandle/);
  assert.match(script, /Escape/);
});

test("the enhanced tribute includes a user-controlled cinematic memory film", async () => {
  const html = await readOptional("index.html");
  const script = await readOptional("app.js");

  assert.match(html, /id="memory-film"/);
  assert.match(html, /id="film-stage"/);
  assert.match(html, /id="film-play"/);
  assert.match(html, /aria-live="polite"[^>]*id="film-status"|id="film-status"[^>]*aria-live="polite"/);
  assert.equal((html.match(/data-film-slide/g) ?? []).length, 6);
  assert.match(script, /function setFilmSlide/);
  assert.match(script, /function toggleMemoryFilm/);
  assert.match(script, /ArrowLeft/);
  assert.match(script, /ArrowRight/);
});

test("the gallery can be filtered without losing accessible lightbox navigation", async () => {
  const html = await readOptional("index.html");
  const script = await readOptional("app.js");

  assert.match(html, /class="gallery-filters"/);
  assert.match(html, /data-filter="all"/);
  assert.match(html, /data-filter="family"/);
  assert.match(html, /data-filter="journey"/);
  assert.match(html, /data-filter="milestone"/);
  assert.match(html, /id="gallery-result"[^>]*aria-live="polite"/);
  assert.equal((html.match(/data-category=/g) ?? []).length, 24);
  assert.match(script, /function filterGallery/);
  assert.match(script, /visibleGalleryItems/);
  assert.match(script, /aria-pressed/);
});

test("the upgraded page provides chapter progress and a printable keepsake", async () => {
  const html = await readOptional("index.html");
  const script = await readOptional("app.js");
  const css = await readOptional("styles.css");

  assert.match(html, /id="page-progress"/);
  assert.match(html, /class="chapter-rail"/);
  assert.match(html, /id="print-tribute"/);
  assert.match(script, /function updateScrollProgress/);
  assert.match(script, /window\.print/);
  assert.match(css, /@media print/);
});

test("Mwai Anthony is the clear memorial identity in the first viewport", async () => {
  const html = await readOptional("index.html");

  assert.match(html, /<title>[^<]*Mwai Anthony/i);
  assert.match(html, /meta name="description"[^>]*Mwai Anthony/i);
  assert.match(html, /<h1[^>]*>[\s\S]*?In loving memory of[\s\S]*?Mwai[\s\S]*?Anthony[\s\S]*?<\/h1>/i);
  assert.match(html, /class="hero-legacy"[^>]*>A beautiful life/i);
});

test("mobile visitors get a five-destination thumb-friendly navigation dock", async () => {
  const html = await readOptional("index.html");
  const css = await readOptional("styles.css");
  const script = await readOptional("app.js");

  assert.match(html, /class="mobile-dock"/);
  assert.equal((html.match(/data-mobile-nav/g) ?? []).length, 5);
  assert.match(html, /href="#memory-film"[^>]*data-mobile-nav/);
  assert.match(html, /href="#memories"[^>]*data-mobile-nav/);
  assert.match(html, /href="#tribute"[^>]*data-mobile-nav/);
  assert.match(css, /padding-bottom:\s*calc\([^;]*env\(safe-area-inset-bottom\)/);
  assert.match(script, /function updateNavigationState/);
  assert.match(script, /nav-scrolled/);
});

test("the visual upgrade includes readable film captions, textures, card motion, and gallery transitions", async () => {
  const html = await readOptional("index.html");
  const css = await readOptional("styles.css");
  const script = await readOptional("app.js");

  assert.equal((html.match(/class="film-caption-surface"/g) ?? []).length, 6);
  assert.match(css, /body::before/);
  assert.match(css, /\.virtue::before/);
  assert.match(css, /\.film-caption-surface/);
  assert.match(css, /@keyframes film-caption-in/);
  assert.match(script, /function animateFilteredItems/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("the memorial name and film controls remain legible and premium on mobile", async () => {
  const html = await readOptional("index.html");
  const css = await readOptional("styles.css");
  const script = await readOptional("app.js");

  assert.match(css, /\.hero-name\s*\{[^}]*overflow:\s*visible/s);
  assert.match(css, /\.hero-name\s*\{[^}]*padding-bottom:/s);
  assert.match(html, /id="film-play" class="film-primary-control"/);
  assert.match(html, /class="film-gesture-hint"/);
  assert.match(css, /#film-play::before/);
  assert.match(css, /conic-gradient/);
  assert.match(css, /-webkit-user-drag:\s*none/);
  assert.match(script, /filmTouchStartX/);
  assert.match(script, /filmStage\.addEventListener\("dragstart"/);
  assert.match(script, /filmStage\.addEventListener\("pointerdown"/);
  assert.match(script, /filmStage\.addEventListener\("pointerup"/);
});

#!/usr/bin/env node
// Draws the fictional sample catalog so the repo needs no stock photos. Every
// image is plain SVG rendered to PNG with the locally installed Chrome.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'images');
mkdirSync(out, { recursive: true });

const serif = `Georgia, 'Times New Roman', serif`;
const sans = `-apple-system, 'Helvetica Neue', Arial, sans-serif`;

const stage = (id, { bg1, bg2 }, body) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".24"/>
      <stop offset=".22" stop-color="#fff" stop-opacity=".16"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".3"/>
    </linearGradient>
    <filter id="${id}-blur"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect width="1200" height="1200" fill="url(#${id}-bg)"/>
  <ellipse cx="600" cy="1006" rx="300" ry="34" fill="#1b1b18" opacity=".26" filter="url(#${id}-blur)"/>
  ${body}
</svg>`;

const label = (x, y, w, h, c, name, sub) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.label}"/>
  <text x="600" y="${y + h * 0.3}" text-anchor="middle" font-family="${sans}" font-size="20" letter-spacing="7" fill="${c.ink}" opacity=".72">TRIAL SUPPLY CO.</text>
  ${name.map((line, i) => `<text x="600" y="${y + h * 0.54 + i * 62}" text-anchor="middle" font-family="${serif}" font-size="56" fill="${c.ink}">${line}</text>`).join('')}
  <text x="600" y="${y + h - 30}" text-anchor="middle" font-family="${sans}" font-size="19" letter-spacing="3" fill="${c.ink}" opacity=".72">${sub}</text>`;

const jar = (id, c, name, sub) => stage(id, c, `
  <rect x="398" y="226" width="404" height="128" rx="18" fill="${c.cap}"/>
  <rect x="398" y="226" width="404" height="128" rx="18" fill="url(#${id}-sheen)"/>
  <rect x="372" y="346" width="456" height="664" rx="42" fill="${c.body}"/>
  ${label(372, 500, 456, 340, c, name, sub)}
  <rect x="372" y="346" width="456" height="664" rx="42" fill="url(#${id}-sheen)"/>`);

const bottle = (id, c, name, sub) => stage(id, c, `
  <rect x="470" y="196" width="260" height="120" rx="14" fill="${c.cap}"/>
  <rect x="470" y="196" width="260" height="120" rx="14" fill="url(#${id}-sheen)"/>
  <path d="M488 316h224v44c0 30 76 44 76 118v480a52 52 0 0 1-52 52H464a52 52 0 0 1-52-52V478c0-74 76-88 76-118z" fill="${c.body}"/>
  ${label(412, 540, 376, 330, c, name, sub)}
  <path d="M488 316h224v44c0 30 76 44 76 118v480a52 52 0 0 1-52 52H464a52 52 0 0 1-52-52V478c0-74 76-88 76-118z" fill="url(#${id}-sheen)"/>`);

const pouch = (id, c, name, sub) => stage(id, c, `
  <path d="M352 232h496l26 776a30 30 0 0 1-30 30H356a30 30 0 0 1-30-30z" fill="${c.body}"/>
  <rect x="352" y="232" width="496" height="58" fill="${c.cap}"/>
  ${label(346, 510, 508, 330, c, name, sub)}
  <path d="M352 232h496l26 776a30 30 0 0 1-30 30H356a30 30 0 0 1-30-30z" fill="url(#${id}-sheen)"/>`);

const sticks = (id, c, name, sub) => stage(id, c, `
  ${[-1, 0, 1].map((n) => `
    <g transform="rotate(${n * 9} 600 980)">
      <rect x="${518}" y="240" width="164" height="760" rx="10" fill="${n === 0 ? c.body : c.cap}"/>
      <rect x="${518}" y="240" width="164" height="42" fill="#fff" opacity=".24"/>
      <rect x="${518}" y="240" width="164" height="760" rx="10" fill="url(#${id}-sheen)"/>
    </g>`).join('')}
  <g>
    <rect x="404" y="610" width="392" height="230" rx="8" fill="${c.label}"/>
    <text x="600" y="664" text-anchor="middle" font-family="${sans}" font-size="17" letter-spacing="6" fill="${c.ink}" opacity=".72">TRIAL SUPPLY CO.</text>
    ${name.map((line, i) => `<text x="600" y="${722 + i * 50}" text-anchor="middle" font-family="${serif}" font-size="44" fill="${c.ink}">${line}</text>`).join('')}
    <text x="600" y="818" text-anchor="middle" font-family="${sans}" font-size="16" letter-spacing="3" fill="${c.ink}" opacity=".72">${sub}</text>
  </g>`);

const scoop = (id, c) => stage(id, c, `
  <g transform="rotate(-32 600 620)">
    <rect x="566" y="470" width="68" height="560" rx="30" fill="${c.body}"/>
    <rect x="566" y="470" width="68" height="560" rx="30" fill="url(#${id}-sheen)"/>
    <path d="M430 300c0-54 76-96 170-96s170 42 170 96v150c0 62-76 112-170 112S430 512 430 450z" fill="${c.body}"/>
    <ellipse cx="600" cy="300" rx="170" ry="96" fill="${c.cap}"/>
    <ellipse cx="600" cy="312" rx="132" ry="66" fill="#000" opacity=".16"/>
    <path d="M430 300c0-54 76-96 170-96s170 42 170 96v150c0 62-76 112-170 112S430 512 430 450z" fill="url(#${id}-sheen)"/>
  </g>`);

const green = { bg1: '#EEF0E4', bg2: '#CFD8BF', body: '#27442F', cap: '#C4A46A', label: '#F6F2E7', ink: '#1C3323' };
const violet = { bg1: '#ECEAF3', bg2: '#CDC8DF', body: '#2C2A4A', cap: '#E9E4F5', label: '#F4F1FA', ink: '#23213D' };
const coral = { bg1: '#F6ECE6', bg2: '#EBCFC2', body: '#B4563C', cap: '#F3E4DA', label: '#FBF4EE', ink: '#5C2415' };
const amber = { bg1: '#F7EFDC', bg2: '#EFD6A5', body: '#D98A1F', cap: '#7A4410', label: '#FFF8E9', ink: '#5E370E' };
const wood = { bg1: '#F0EBE0', bg2: '#DCD2BD', body: '#B98A52', cap: '#8E6336', label: '#fff', ink: '#000' };

const products = {
  'product-daily-greens': jar('a', green, ['Daily Greens'], 'POWDER · 30 SERVINGS'),
  'product-travel-sticks': sticks('b', green, ['Travel Sticks'], 'DAILY GREENS · 14 PACK'),
  'product-magnesium-night': bottle('c', violet, ['Magnesium', 'Night'], '60 CAPSULES'),
  'product-marine-collagen': jar('d', coral, ['Marine', 'Collagen'], 'PEPTIDES · 300 G'),
  'product-vitamin-c-mix': pouch('e', amber, ['Vitamin C', 'Drink Mix'], '30 SERVINGS'),
  'product-bamboo-scoop': scoop('f', wood),
};

const tile = (tint, ink, art) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="640" height="640">
  <rect width="640" height="640" fill="${tint}"/>
  <g fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${art}</g>
</svg>`;

const ingredients = {
  'ingredient-spirulina': tile('#DDE9E3', '#1F5A4C', `<path d="M320 320c0-22 34-22 34 6 0 44-72 50-88 0-20-62 56-112 116-82 72 36 74 150 8 196-82 58-208 8-222-96-14-100 74-192 176-188"/>`),
  'ingredient-wheatgrass': tile('#E6EBD3', '#4F6A22', `<path d="M320 520V200"/><path d="M320 320c-70-20-110-70-120-140 70 10 110 60 120 140z"/><path d="M320 320c70-20 110-70 120-140-70 10-110 60-120 140z"/><path d="M320 430c-70-20-110-70-120-140 70 10 110 60 120 140z"/><path d="M320 430c70-20 110-70 120-140-70 10-110 60-120 140z"/>`),
  'ingredient-matcha': tile('#E1E9CF', '#46612A', `<path d="M170 300h300c0 110-60 170-150 170s-150-60-150-170z"/><path d="M250 500h140"/><path d="M320 300c-10-60 20-110 90-130 10 70-20 120-90 130z"/>`),
  'ingredient-ginger-root': tile('#F2E6CC', '#8A5A1B', `<path d="M210 410c-50-30-50-110 10-130 20-60 100-70 130-20 60-30 130 10 120 80 40 40 10 120-60 110-30 40-100 40-130 0-30 10-50-10-70-40z"/><path d="M300 330c20 10 40 10 60 0"/><path d="M260 390c30 16 70 16 100 0"/>`),
  'ingredient-marine-collagen': tile('#D8E7EC', '#21586B', `<path d="M180 200c70 40 70 90 140 120s70 80 140 120"/><path d="M460 200c-70 40-70 90-140 120s-70 80-140 120"/><path d="M230 240h180"/><path d="M270 320h100"/><path d="M230 400h180"/>`),
  'ingredient-vitamin-c': tile('#F8E7C4', '#A9650C', `<circle cx="320" cy="320" r="160"/><circle cx="320" cy="320" r="118"/><path d="M320 202v236"/><path d="M202 320h236"/><path d="M237 237l166 166"/><path d="M403 237L237 403"/>`),
};

const browser = await chromium.launch({ channel: 'chrome' });

async function shoot(name, svg, size) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  await page.close();
  console.log(`rendered ${name}.png`);
}

for (const [name, svg] of Object.entries(products)) await shoot(name, svg, 1200);
for (const [name, svg] of Object.entries(ingredients)) await shoot(name, svg, 640);

await browser.close();

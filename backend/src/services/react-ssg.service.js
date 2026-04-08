/**
 * React SSG Service — Generates static HTML from React V1 templates.
 * Replaces the Handlebars-based ssg.service.js.
 *
 * Uses esbuild to transpile JSX templates at runtime, then renderToString().
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import { transformSync } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../../../templates');
const FONTS_DIR = path.join(TEMPLATES_DIR, 'fonts');
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CACHE_DIR = path.join(__dirname, '../../.ssg-cache');

// --- Font metadata (same as ssg.service.js) ---
const FONT_META = {
  'Playfair Display': { slug: 'playfair-display', category: 'serif', weights: [400, 700] },
  'Montserrat': { slug: 'montserrat', category: 'sans-serif', weights: [400, 700] },
  'Lora': { slug: 'lora', category: 'serif', weights: [400, 700] },
  'Merriweather': { slug: 'merriweather', category: 'serif', weights: [400, 700] },
  'Poppins': { slug: 'poppins', category: 'sans-serif', weights: [400, 700] },
  'Raleway': { slug: 'raleway', category: 'sans-serif', weights: [400, 700] },
  'Inter': { slug: 'inter', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Open Sans': { slug: 'open-sans', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Lato': { slug: 'lato', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Roboto': { slug: 'roboto', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Source Sans Pro': { slug: 'source-sans-pro', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Nunito': { slug: 'nunito', category: 'sans-serif', weights: [300, 400, 500, 600] },
  'Cormorant Garamond': { slug: 'cormorant-garamond', category: 'serif', weights: [300, 400, 600, 700] },
};

// --- Template loading via esbuild ---
let templateModules = {};

/**
 * Transpile a JSX file to ESM .mjs, write to cache, and import dynamically.
 */
async function loadJsxTemplate(filePath) {
  const source = await fs.readFile(filePath, 'utf-8');
  const result = transformSync(source, {
    loader: 'jsx',
    jsx: 'automatic',
    format: 'esm',
    target: 'node18',
    platform: 'node',
  });

  // Write transpiled ESM to cache directory
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const basename = path.basename(filePath, '.jsx');
  const cachePath = path.join(CACHE_DIR, `${basename}.mjs`);
  await fs.writeFile(cachePath, result.code);

  // Import the transpiled module dynamically
  const cacheUrl = pathToFileURL(cachePath).href + `?t=${Date.now()}`;
  const mod = await import(cacheUrl);
  return mod;
}

async function loadTemplates() {
  const templateDir = path.join(__dirname, '../templates/styles');
  const helperPath = path.join(__dirname, '../templates/sectionHelpers.js');

  // Transpile sectionHelpers.js to cache as .mjs so templates can import it
  const helperSource = await fs.readFile(helperPath, 'utf-8');
  const helperResult = transformSync(helperSource, { loader: 'js', format: 'esm', target: 'node18', platform: 'node' });
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(path.join(CACHE_DIR, 'sectionHelpers.mjs'), helperResult.code);

  const styles = ['ModernTemplate', 'BoldTemplate', 'ElegantTemplate', 'MinimalTemplate', 'ArtisticTemplate'];
  for (const style of styles) {
    try {
      // Patch the template source to import sectionHelpers from cache
      const templatePath = path.join(templateDir, `${style}.jsx`);
      let source = await fs.readFile(templatePath, 'utf-8');
      source = source.replace(
        /from\s+['"]\.\.\/sectionHelpers['"]/g,
        `from '${pathToFileURL(path.join(CACHE_DIR, 'sectionHelpers.mjs')).href}'`
      );
      // Write patched source to a temp file, transpile from there
      const patchedPath = path.join(CACHE_DIR, `${style}_patched.jsx`);
      await fs.writeFile(patchedPath, source);
      const mod = await loadJsxTemplate(patchedPath);
      templateModules[style.replace('Template', '').toLowerCase()] = mod.default || mod;
      console.log(`[react-ssg] Loaded template: ${style}`);
    } catch (err) {
      console.error(`[react-ssg] Failed to load ${style}:`, err.message);
    }
  }
}

// --- Reused utility functions from ssg.service.js ---

function hexToRgb(hex) {
  const h = (hex || '').replace('#', '');
  const bigint = parseInt(h, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function getContrastColor(hexBg) {
  const h = (hexBg || '').replace('#', '');
  if (h.length < 6) return '#333333';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)
            + 0.7152 * (g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4)
            + 0.0722 * (b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4);
  return lum > 0.35 ? '#333333' : '#ffffff';
}

function generateCssVars(design) {
  const primary = design.primaryColor || '#12203e';
  const isSquare = design.borderRadius === 'square';
  return `:root {
  --color-primary: ${primary};
  --color-primary-rgb: ${hexToRgb(primary)};
  --color-accent: ${design.accentColor || '#c8a97e'};
  --color-bg: ${design.backgroundColor || '#ffffff'};
  --color-text: ${design.textColor || '#333333'};
  --font-heading: '${design.fontHeading || 'Playfair Display'}', ${FONT_META[design.fontHeading]?.category || 'serif'};
  --font-body: '${design.fontBody || 'Inter'}', ${FONT_META[design.fontBody]?.category || 'sans-serif'};
  --radius-sm: ${isSquare ? '2px' : '8px'};
  --radius-md: ${isSquare ? '4px' : '16px'};
  --radius-lg: ${isSquare ? '6px' : '20px'};
  --radius-pill: ${isSquare ? '4px' : '50px'};
}`;
}

function generateFontFaceCss(fontHeading, fontBody) {
  const fontsUsed = new Set([fontHeading, fontBody]);
  let css = '';
  for (const fontName of fontsUsed) {
    const meta = FONT_META[fontName];
    if (!meta) continue;
    for (const weight of meta.weights) {
      css += `@font-face{font-family:'${fontName}';font-style:normal;font-weight:${weight};font-display:swap;src:url('fonts/${meta.slug}-${weight}.woff2') format('woff2')}\n`;
    }
  }
  return css;
}

function generateFontPreloads(fontHeading, fontBody) {
  const headingMeta = FONT_META[fontHeading];
  const bodyMeta = FONT_META[fontBody];
  let html = '';
  if (headingMeta) html += `<link rel="preload" as="font" type="font/woff2" href="fonts/${headingMeta.slug}-700.woff2" crossorigin>\n`;
  if (bodyMeta && bodyMeta.slug !== headingMeta?.slug) html += `  <link rel="preload" as="font" type="font/woff2" href="fonts/${bodyMeta.slug}-400.woff2" crossorigin>\n`;
  return html;
}

export function generateJsonLd(site, page) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': page.seo?.jsonLd?.type || 'LocalBusiness',
    name: site.business?.name || site.name,
    description: page.seo?.description || '',
  };
  if (site.business?.address || site.business?.city) {
    ld.address = {
      '@type': 'PostalAddress',
      streetAddress: site.business.address || '',
      addressLocality: site.business.city || '',
      postalCode: site.business.zip || '',
      addressCountry: site.business.country || 'CH',
    };
  }
  if (site.business?.phone) ld.telephone = site.business.phone;
  if (site.business?.email) ld.email = site.business.email;
  if (site.business?.googleReviewRating && site.business?.googleReviewCount) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: site.business.googleReviewRating,
      reviewCount: site.business.googleReviewCount,
    };
  }
  if (site.domain) ld.url = `https://${site.domain}/${page.isMainHomepage ? '' : page.slug + '.html'}`;
  if (page.seo?.jsonLd?.customFields) Object.assign(ld, page.seo.jsonLd.customFields);
  return ld;
}

export function generateFaqJsonLd(sections) {
  const faqSection = (Array.isArray(sections) ? sections : []).find(s => s.type === 'faq' && s.visible !== false);
  if (!faqSection?.data?.items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSection.data.items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function generateRobotsTxt(domain) {
  return `User-agent: *\nAllow: /\nSitemap: https://${domain}/sitemap.xml\n`;
}

export function generateSitemapXml(domain, pages) {
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemapschemas.org/sitemap/0.9">\n';
  for (const page of pages) {
    const loc = page.isMainHomepage ? `https://${domain}/` : `https://${domain}/${page.slug}.html`;
    const priority = page.isMainHomepage ? '1.0' : page.type === 'homepage' ? '0.8' : page.type === 'city' ? '0.6' : '0.5';
    xml += `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>\n`;
  }
  xml += '</urlset>';
  return xml;
}

// --- Media resolution (reused from ssg.service.js) ---

export function resolveMediaInData(data, mediaMap) {
  if (!data || typeof data !== 'object') return data;
  const resolved = { ...data };

  for (const [key, value] of Object.entries(resolved)) {
    if (key.endsWith('MediaId') && value) {
      const mediaId = typeof value === 'object' ? value._id?.toString() : value?.toString();
      const media = mediaMap[mediaId];
      if (media) {
        const baseKey = key.replace('MediaId', '');
        const variant800 = media.variants?.find(v => v.suffix === '-800w') || media.variants?.[0];
        resolved[`${baseKey}Url`] = variant800 ? `images/${path.basename(variant800.storagePath)}` : `images/${media.filename}`;
        if (media.variants?.length) {
          resolved[`${baseKey}Srcset`] = media.variants.map(v => `images/${path.basename(v.storagePath)} ${v.width}w`).join(', ');
        }
        resolved[`${baseKey}Alt`] = media.alt || '';
        resolved[`${baseKey}Width`] = media.width;
        resolved[`${baseKey}Height`] = media.height;
      }
    }
    if (Array.isArray(value)) {
      resolved[key] = value.map(item => (typeof item === 'object' ? resolveMediaInData(item, mediaMap) : item));
    }
  }
  return resolved;
}

// --- Main render function ---

import { EDIT_BRIDGE_SCRIPT } from './edit-bridge.js';

/**
 * Render a page to HTML using React templates.
 * @param {Object} site - Site document
 * @param {Object} page - Page document with sections
 * @param {Object} options - { mediaMap, allPages, templateCss }
 * @returns {string} Complete HTML document
 */
export async function renderPage(site, page, options = {}) {
  const { mediaMap = {}, allPages = [], templateCss = '' } = options;

  // Ensure templates are loaded
  if (Object.keys(templateModules).length === 0) {
    await loadTemplates();
  }

  const designStyle = site.designStyle || 'modern';
  const TemplateComponent = templateModules[designStyle] || templateModules.modern;

  if (!TemplateComponent) {
    throw new Error(`Template not found for style: ${designStyle}`);
  }

  // Resolve media in sections
  const resolvedSections = (page.sections || []).map(section => ({
    ...section,
    data: resolveMediaInData(section.data || {}, mediaMap),
  }));

  // Build site props
  const siteProps = {
    name: site.name,
    siteName: site.name,
    tagline: site.business?.activity || '',
    colors: {
      primary: site.design?.primaryColor || '#0ea5e9',
      secondary: site.design?.secondaryColor || '#1e293b',
      accent: site.design?.accentColor || '#f59e0b',
    },
    googleReviewRating: site.business?.googleReviewRating || null,
    googleReviewCount: site.business?.googleReviewCount || null,
  };

  // Render React component to string
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');

  const element = React.createElement(TemplateComponent, {
    sections: resolvedSections,
    site: siteProps,
    isMobile: false,
    onNavigate: null,
  });

  const bodyHtml = renderToString(element);

  // Build CSS
  const fontHeading = site.design?.fontHeading || 'Playfair Display';
  const fontBody = site.design?.fontBody || 'Inter';
  const cssVars = generateCssVars(site.design || {});
  const fontFaces = generateFontFaceCss(fontHeading, fontBody);
  const fontPreloads = generateFontPreloads(fontHeading, fontBody);

  // Build JSON-LD
  const jsonLdItems = [generateJsonLd(site, page)];
  const faqLd = generateFaqJsonLd(resolvedSections);
  if (faqLd) jsonLdItems.push(faqLd);
  const jsonLdHtml = jsonLdItems.map(ld => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('\n  ');

  // SEO
  const pageTitle = page.seo?.title || `${page.title} | ${site.name}`;
  const pageDesc = page.seo?.description || site.business?.description || '';
  const pageUrl = site.domain ? `https://${site.domain}/${page.isMainHomepage ? '' : page.slug + '.html'}` : '';

  // Favicon
  let faviconHtml = '<link rel="icon" href="favicon.ico">';
  if (site.design?.faviconMediaId?.filename) {
    const ext = path.extname(site.design.faviconMediaId.filename).toLowerCase();
    const type = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/x-icon';
    faviconHtml = `<link rel="icon" type="${type}" href="favicon.ico">`;
  }

  // Assemble full HTML
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDesc)}">
  ${pageUrl ? `<link rel="canonical" href="${pageUrl}">` : ''}
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(pageDesc)}">
  ${pageUrl ? `<meta property="og:url" content="${pageUrl}">` : ''}
  ${jsonLdHtml}
  ${fontPreloads}
  ${faviconHtml}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${fontFaces}
    ${cssVars}
    ${templateCss}
    /* Base reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { -webkit-font-smoothing: antialiased; }
    img { max-width: 100%; height: auto; }
    .is-editor [data-editable]:hover { outline: 2px dashed rgba(124,58,237,0.6); outline-offset: 3px; }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>${EDIT_BRIDGE_SCRIPT}</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Note: renderPage, generateJsonLd, generateFaqJsonLd, generateRobotsTxt,
// generateSitemapXml, resolveMediaInData are already exported inline above.

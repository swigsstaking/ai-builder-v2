import puppeteer from 'puppeteer';

/**
 * Auto-scroll page to trigger lazy loading (faster version)
 */
const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 600;
      const maxScrolls = 10;
      let scrollCount = 0;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;
        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
};

/**
 * Hide cookie banners and popups
 */
const hideCookieBanners = async (page) => {
  await page.evaluate(() => {
    const selectors = [
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="consent"]', '[id*="consent"]',
      '[class*="gdpr"]', '[id*="gdpr"]',
      '[class*="privacy"]', '[id*="privacy-banner"]',
      '[class*="popup"]', '[class*="modal"]',
      '.cc-banner', '#onetrust-banner-sdk',
      '.cookie-notice', '.cookie-bar',
    ];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    });
    const acceptButtons = document.querySelectorAll(
      '[class*="accept"], [id*="accept"], button[class*="cookie"], .cc-accept'
    );
    acceptButtons.forEach(btn => { try { btn.click(); } catch {} });
  });
};

/**
 * Capture screenshots of a website's pages.
 * Supports a streaming callback `onScreenshot(data)` called after each capture
 * so the caller can start OCR immediately without waiting for all pages.
 */
export const captureWebsiteScreenshots = async (url, options = {}) => {
  const {
    viewport = { width: 1280, height: 900 },
    fullPage = false,
    timeout = 20000,
    maxPages = 8,
    onScreenshot = null, // callback(screenshotData) — called as each page is captured
  } = options;

  const baseUrl = url.startsWith('http') ? url : `https://${url}`;
  console.log(`📸 Starting screenshot capture for: ${baseUrl}`);

  let browser;
  const screenshots = [];

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-web-security', '--ignore-certificate-errors'],
    });

    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Block heavy resources for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['media', 'font'].includes(req.resourceType())) req.abort();
      else req.continue();
    });

    // ── Capture homepage (required — if this fails, throw) ──
    try {
      console.log(`📸 Capturing: ${baseUrl}`);
      await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout });
      await hideCookieBanners(page);
      await autoScroll(page);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      const screenshot = await page.screenshot({ fullPage, type: 'jpeg', quality: 85 });

      // Extract brand colors from CSS/HTML (instant, no AI needed)
      const extractedColors = await page.evaluate(() => {
        const colorCounts = {};
        const useless = new Set(['#000', '#000000', '#fff', '#ffffff', '#111', '#111111', '#181818', '#1a1a1a', '#222', '#222222', '#333', '#333333', '#eee', '#eeeeee', '#f5f5f5', '#f4f4f4', '#fefefe', '#fafafa', '#0000ee', '#0000ff', '#0056b3', '#116dff', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(0,0,0)', 'rgb(255,255,255)', 'rgb(24, 24, 24)', 'rgb(0, 0, 238)', 'rgb(0, 0, 255)', 'rgb(17, 109, 255)', 'transparent', 'inherit', 'initial']);

        const normalizeHex = (c) => {
          if (!c) return null;
          c = c.trim().toLowerCase();
          if (useless.has(c)) return null;
          // Expand 3-char hex
          if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
          if (/^#[0-9a-f]{6}$/i.test(c)) return c;
          // Convert rgb() to hex
          const m = c.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (m) {
            const hex = '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
            return useless.has(hex) ? null : hex;
          }
          return null;
        };

        // 1. Meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]')?.content;

        // 2. CSS custom properties from :root
        const rootStyle = getComputedStyle(document.documentElement);
        const cssVarNames = ['--primary', '--accent', '--brand', '--color-primary', '--color-accent', '--main-color', '--theme-color', '--brand-color', '--primary-color', '--secondary-color'];
        const cssVarColors = [];
        for (const v of cssVarNames) {
          const val = rootStyle.getPropertyValue(v).trim();
          if (val) cssVarColors.push(normalizeHex(val));
        }

        // 3. Computed colors from key elements — buttons/CTA get extra weight
        const ctaSelectors = ['button', '.btn', '[class*="btn"]', '[class*="button"]', '[class*="cta"]', '[class*="reservation"]', '[class*="booking"]', 'a[class*="btn"]'];
        const normalSelectors = ['a', 'nav', 'h1', 'h2', '[class*="primary"]', '[class*="accent"]', '[class*="brand"]', 'header'];

        // CTA elements get 5x weight (brand colors are most visible on buttons)
        for (const sel of ctaSelectors) {
          document.querySelectorAll(sel).forEach(el => {
            const s = getComputedStyle(el);
            [s.backgroundColor, s.borderColor].forEach(c => {
              const hex = normalizeHex(c);
              if (hex) colorCounts[hex] = (colorCounts[hex] || 0) + 5;
            });
          });
        }
        for (const sel of normalSelectors) {
          document.querySelectorAll(sel).forEach(el => {
            const s = getComputedStyle(el);
            [s.color, s.backgroundColor, s.borderColor].forEach(c => {
              const hex = normalizeHex(c);
              if (hex) colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            });
          });
        }

        // 4. Inline style hex colors
        document.querySelectorAll('[style]').forEach(el => {
          const matches = (el.getAttribute('style') || '').match(/#[0-9a-fA-F]{3,6}/g);
          if (matches) matches.forEach(c => {
            const hex = normalizeHex(c);
            if (hex) colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          });
        });

        // Sort by frequency
        const sorted = Object.entries(colorCounts).sort((a,b) => b[1] - a[1]).map(e => e[0]);

        // Detect body background to exclude it from "brand" colors
        const bodyBg = normalizeHex(getComputedStyle(document.body).backgroundColor);

        // Separate: brand colors (not background) vs background
        const brandColors = sorted.filter(c => c !== bodyBg);
        const bgColor = bodyBg || sorted.find(c => !brandColors.includes(c));

        // Build result: CSS vars > meta > brand colors by frequency
        const validCssVars = cssVarColors.filter(Boolean);
        const themeHex = normalizeHex(metaTheme);
        const primary = validCssVars[0] || themeHex || brandColors[0] || sorted[0] || null;
        const accent = validCssVars[1] || brandColors.find(c => c !== primary) || brandColors[1] || null;
        const secondary = bgColor || sorted.find(c => c !== primary && c !== accent) || null;

        // 5. Extract Google Maps URL from page links
        let googleMapsUrl = null;
        document.querySelectorAll('a[href*="google.com/maps"], a[href*="goo.gl/maps"], a[href*="g.page"]').forEach(a => {
          if (!googleMapsUrl) googleMapsUrl = a.href;
        });

        return { primary, secondary, accent, all: sorted.slice(0, 8), googleMapsUrl };
      });

      const data = { page: '/', url: baseUrl, screenshot, size: screenshot.length, extractedColors };
      screenshots.push(data);
      if (onScreenshot) onScreenshot(data);
      console.log(`✅ Captured homepage (${(screenshot.length / 1024).toFixed(1)}KB)`, extractedColors?.primary ? `colors: ${extractedColors.primary}, ${extractedColors.accent}` : 'no colors');
    } catch (err) {
      console.error(`❌ Failed to capture homepage:`, err.message);
      // Homepage is required — propagate error with clear message
      throw new Error(`Homepage capture failed: ${err.message}`);
    }

    // ── Find nav links and capture other pages ──
    try {
      const navLinks = await page.evaluate(() => {
        const links = [];
        const seen = new Set();
        document.querySelectorAll('nav a, header a, .nav a, .menu a').forEach(a => {
          const href = a.getAttribute('href');
          const text = a.textContent.trim();
          if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !seen.has(href)) {
            seen.add(href);
            links.push({ href, text });
          }
        });
        return links;
      });

      const pagesToCapture = navLinks.slice(0, maxPages - 1);

      for (const link of pagesToCapture) {
        try {
          const pageUrl = link.href.startsWith('http')
            ? link.href
            : new URL(link.href, baseUrl).href;
          if (!pageUrl.includes(new URL(baseUrl).hostname)) continue;

          console.log(`📸 Capturing: ${pageUrl} (${link.text})`);
          await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout });
          await page.evaluate(() => new Promise(r => setTimeout(r, 300)));

          const screenshot = await page.screenshot({ fullPage, type: 'jpeg', quality: 80 });
          const data = { page: link.href, pageName: link.text, url: pageUrl, screenshot, size: screenshot.length };
          screenshots.push(data);
          if (onScreenshot) onScreenshot(data);
          console.log(`✅ Captured ${link.text} (${(screenshot.length / 1024).toFixed(1)}KB)`);
        } catch (err) {
          console.error(`❌ Failed to capture ${link.text}:`, err.message);
        }
      }
    } catch (err) {
      console.error('❌ Error finding navigation links:', err.message);
    }

  } catch (error) {
    console.error('❌ Screenshot service error:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  console.log(`📸 Captured ${screenshots.length} screenshots total`);
  return screenshots;
};

export const capturePageScreenshot = async (url, options = {}) => {
  const { viewport = { width: 1920, height: 1080 }, fullPage = true } = options;
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
    return await page.screenshot({ fullPage, type: 'jpeg', quality: 80 });
  } finally {
    if (browser) await browser.close();
  }
};

export default { captureWebsiteScreenshots, capturePageScreenshot };

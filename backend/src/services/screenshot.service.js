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
      const data = { page: '/', url: baseUrl, screenshot, size: screenshot.length };
      screenshots.push(data);
      if (onScreenshot) onScreenshot(data);
      console.log(`✅ Captured homepage (${(screenshot.length / 1024).toFixed(1)}KB)`);
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

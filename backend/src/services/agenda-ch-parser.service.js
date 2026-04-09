import puppeteer from 'puppeteer';

/**
 * Parse agenda.ch practitioner pages.
 * Extracts structured data (JSON-LD) + services via DOM scraping.
 *
 * Works for URLs like: https://centre-meta-cap.agenda.ch/fr
 */
export async function parseAgendaCh(sourceUrl) {
  console.log(`[agenda-ch] Parsing: ${sourceUrl}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(sourceUrl, { waitUntil: 'networkidle2', timeout: 20000 });
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

    // Step 1: Extract JSON-LD structured data
    const jsonLdData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent);
          if (data['@type']?.includes('LocalBusiness') || data['@type'] === 'LocalBusiness' ||
              data['@type']?.includes('MedicalBusiness') || data['@type'] === 'MedicalBusiness') {
            return data;
          }
        } catch {}
      }
      return null;
    });

    // Step 2: Click first category to reveal all services (agenda.ch loads them all at once)
    const firstCard = await page.$('.service-card.stacked');
    if (firstCard) {
      await firstCard.click();
      await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
    }

    // Step 3: Extract all services from .service-card-content elements
    const allServices = await page.evaluate(() => {
      const result = [];
      document.querySelectorAll('.service-card-content').forEach(el => {
        const name = el.querySelector('.service-card-title')?.textContent?.trim();
        if (!name) return;

        const allText = el.innerText.trim();
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l && l !== 'voir plus...');

        // Must have a duration line (contains "heure" or "minute") to be a real service
        const durationLine = lines.find(l => /heure|minute|min/i.test(l) && !l.includes(name));
        if (!durationLine) return; // skip category cards

        // Description = lines between duration and "voir plus..."
        const descIdx = lines.indexOf(durationLine);
        const description = lines.slice(descIdx + 1).join(' ').replace(/\s+/g, ' ').slice(0, 300);

        result.push({ name, duration: durationLine, description });
      });
      return result;
    });

    console.log(`[agenda-ch] Extracted ${allServices.length} services`);

    // Step 4: Build extractedContent matching migration schema
    const address = jsonLdData?.address || {};
    const contactPoint = jsonLdData?.contactPoint || {};

    return {
      businessName: jsonLdData?.name || '',
      businessType: jsonLdData?.description?.split('-')[0]?.trim() || 'Praticien',
      description: jsonLdData?.description || '',
      tagline: jsonLdData?.description || '',
      contactInfo: {
        phone: contactPoint.telephone || '',
        email: contactPoint.email || '',
        address: [address.streetAddress, address.postalCode, address.addressLocality].filter(Boolean).join(', '),
      },
      services: allServices.map(s => ({
        title: s.name,
        description: `${s.duration} — ${s.description}`.slice(0, 300),
      })),
      colors: { primary: null, secondary: null, accent: null },
      detectedSections: ['hero-practitioner', 'services-booking', 'about', 'booking-widget', 'contact'],
      seo: {
        title: jsonLdData?.name || '',
        description: jsonLdData?.description || '',
        keywords: [],
      },
      // Extra fields specific to agenda.ch
      googleMapsUrl: jsonLdData?.geo ? `https://www.google.com/maps?q=${jsonLdData.geo.latitude},${jsonLdData.geo.longitude}` : null,
      externalWebsite: jsonLdData?.url || '',
      agendaCompanyId: jsonLdData?.potentialAction?.target?.urlTemplate?.match(/companyId=(\d+)/)?.[1] || null,
    };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Check if a URL is an agenda.ch site
 */
export function isAgendaChUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith('agenda.ch');
  } catch {
    return false;
  }
}

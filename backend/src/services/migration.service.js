import fs from 'fs/promises';
import path from 'path';
import Migration from '../models/Migration.js';
import { captureWebsiteScreenshots } from './screenshot.service.js';
import { analyzeScreenshots } from './vision.service.js';
import { scrapeWebsite } from './scraper.service.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Normalize vision analysis output into a consistent extractedContent shape.
 * Handles both wrapped ({analysis: {extractedInfo: ...}}) and flat ({businessName: ...}) formats.
 */
function normalizeAnalysis(analysisResult) {
  const a = analysisResult?.analysis || analysisResult || {};
  const info = a.extractedInfo || a;
  const brief = a.creativeBrief || {};
  const seo = a.seo || info.seo || {};
  const rawColors = info.detectedColors || info.colors || brief.colors || {};
  // Filter out useless black/white/near-black/near-white colors
  const useless = new Set(['#000000', '#000', '#ffffff', '#fff', '#111111', '#0f0f0f', '#fefefe', '#1a1a1a', '#222222', '#333333', '#f5f5f5', '#eeeeee', '#e5e5e5']);
  const ok = (c) => c && !useless.has(c.toLowerCase());
  const colors = {
    primary: ok(rawColors.primary) ? rawColors.primary : (ok(rawColors.mainColor) ? rawColors.mainColor : null),
    secondary: ok(rawColors.secondary) ? rawColors.secondary : (ok(rawColors.backgroundColor) ? rawColors.backgroundColor : null),
    accent: ok(rawColors.accent) ? rawColors.accent : (ok(rawColors.accentColor) ? rawColors.accentColor : null),
  };

  return {
    businessName: info.businessName || '',
    businessType: info.businessType || brief.siteType || '',
    description: info.description || '',
    tagline: info.tagline || '',
    contactInfo: {
      phone: info.contactInfo?.phone || '',
      email: info.contactInfo?.email || '',
      address: info.contactInfo?.address || '',
    },
    services: (info.services || []).map(s => ({
      title: s.title || s.name || '',
      description: s.description || s.shortDescription || '',
    })),
    colors: {
      primary: colors.primary || null,
      secondary: colors.secondary || null,
      accent: colors.accent || null,
      _detected: !!(colors.primary || colors.secondary || colors.accent),
    },
    detectedSections: info.detectedSections || brief.suggestedSections || [],
    seo: {
      title: seo.title || '',
      description: seo.description || '',
      keywords: seo.keywords || [],
    },
  };
}

/**
 * Normalize scraped text data into the same extractedContent shape
 */
function normalizeScrapedData(scraped) {
  return {
    businessName: scraped.title || '',
    businessType: scraped.detectedBusinessType || 'entreprise',
    description: scraped.metaDescription || scraped.paragraphs?.[0] || '',
    tagline: scraped.headings?.h1?.[0] || '',
    contactInfo: {
      phone: scraped.contactInfo?.phones?.[0] || '',
      email: scraped.contactInfo?.emails?.[0] || '',
      address: scraped.contactInfo?.addresses?.[0] || '',
    },
    services: (scraped.headings?.h2 || []).slice(0, 6).map(h => ({
      title: h,
      description: '',
    })),
    colors: {
      primary: scraped.colors?.[0] || null,
      secondary: scraped.colors?.[1] || null,
      accent: scraped.colors?.[2] || null,
      _detected: !!(scraped.colors?.length),
    },
    detectedSections: ['hero', 'description', 'services-grid', 'contact'],
    seo: {
      title: scraped.title || '',
      description: scraped.metaDescription || '',
      keywords: scraped.metaKeywords ? scraped.metaKeywords.split(',').map(k => k.trim()) : [],
    },
  };
}

/**
 * Run the full analysis pipeline with streaming OCR:
 * 1. Capture screenshots (streaming — OCR starts as each page is captured)
 * 2. Structure OCR results with LLM
 * 3. Fallback to text scraping if vision fails
 *
 * Progress: 0-15% capturing, 15-70% OCR, 70-95% structuring, 95-100% done
 */
export async function runAnalysisPipeline(migrationId) {
  const migration = await Migration.findById(migrationId);
  if (!migration) throw new Error('Migration not found');

  const { sourceUrl } = migration;

  try {
    // Step 1: Capture screenshots with streaming OCR callback
    migration.status = 'capturing';
    migration.currentStep = 'Capture des pages du site...';
    migration.progress = 5;
    await migration.save();

    const screenshotDir = path.join(UPLOAD_DIR, 'migrations', migrationId.toString());
    await fs.mkdir(screenshotDir, { recursive: true });

    const savedScreenshots = [];
    let screenshotIdx = 0;

    // Callback: save each screenshot to disk as it arrives
    const onScreenshot = async (data) => {
      const idx = screenshotIdx++;
      const filename = `page-${idx}.jpg`;
      try {
        await fs.writeFile(path.join(screenshotDir, filename), data.screenshot);
        savedScreenshots.push({
          page: data.pageName || data.page || `page-${idx}`,
          filename,
          size: data.screenshot.length,
        });
      } catch {}
    };

    let screenshots = [];
    try {
      screenshots = await captureWebsiteScreenshots(sourceUrl, {
        maxPages: 8,
        fullPage: false,
        onScreenshot,
      });
      console.log(`[migration] Captured ${screenshots.length} screenshots`);
    } catch (err) {
      console.warn(`[migration] Screenshot capture failed: ${err.message}`);
    }

    migration.screenshots = savedScreenshots;
    migration.progress = 15;
    migration.currentStep = `${screenshots.length} pages capturées — Analyse OCR...`;
    await migration.save();

    // Step 2: Analyze with vision AI (OCR + structuring)
    migration.status = 'analyzing';
    await migration.save();

    let analysisResult = null;
    let provider = null;

    if (screenshots.length > 0) {
      analysisResult = await analyzeScreenshots(screenshots, sourceUrl);
      if (analysisResult) {
        provider = analysisResult.provider;
      }
    }

    // Step 3: Fallback to text scraping
    if (!analysisResult) {
      console.log('[migration] Falling back to text scraping');
      migration.currentStep = 'Extraction du texte du site...';
      migration.progress = 80;
      await migration.save();

      const scraped = await scrapeWebsite(sourceUrl);
      migration.analysisResult = scraped;
      migration.analysisProvider = 'text-scraping';
      migration.extractedContent = normalizeScrapedData(scraped);
    } else {
      migration.analysisResult = analysisResult.analysis || analysisResult;
      migration.analysisProvider = provider;
      migration.extractedContent = normalizeAnalysis(analysisResult);
    }

    // Inject CSS-extracted colors from homepage screenshot (more reliable than AI)
    const homepageData = screenshots.find(s => s.page === '/' || s.page === 'homepage');
    const cssColors = homepageData?.extractedColors;
    if (cssColors && (cssColors.primary || cssColors.accent)) {
      const ec = migration.extractedContent;
      if (!ec.colors?._detected) {
        ec.colors = {
          primary: cssColors.primary || cssColors.accent || ec.colors?.primary || null,
          secondary: ec.colors?.secondary || null,
          accent: cssColors.accent || cssColors.primary || ec.colors?.accent || null,
          _detected: true,
        };
        migration.markModified('extractedContent');
        console.log(`[migration] Injected CSS colors: primary=${ec.colors.primary}, accent=${ec.colors.accent}`);
      }
    }

    // Done
    migration.status = 'analyzed';
    migration.currentStep = 'Analyse terminée';
    migration.progress = 100;
    await migration.save();

    console.log(`[migration] Analysis complete for ${sourceUrl} via ${migration.analysisProvider}`);
    return migration;

  } catch (error) {
    console.error(`[migration] Pipeline error:`, error.message);
    migration.status = 'error';
    migration.error = error.message;
    migration.currentStep = 'Erreur';
    await migration.save();
    throw error;
  }
}

/**
 * Clean up temporary screenshot files for a migration
 */
export async function cleanupScreenshots(migrationId) {
  const screenshotDir = path.join(UPLOAD_DIR, 'migrations', migrationId.toString());
  try {
    await fs.rm(screenshotDir, { recursive: true, force: true });
    console.log(`[migration] Cleaned up screenshots for ${migrationId}`);
  } catch {}
}

export default { runAnalysisPipeline, cleanupScreenshots };

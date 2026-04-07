import Migration from '../models/Migration.js';
import { runAnalysisPipeline, cleanupScreenshots } from '../services/migration.service.js';

/**
 * POST /api/migration/analyze
 * Start analysis of a source URL
 */
export async function startAnalysis(req, res) {
  try {
    const { sourceUrl, mode = 'faithful' } = req.body;

    if (!sourceUrl) {
      return res.status(400).json({ error: 'sourceUrl est requis' });
    }

    // Create migration record
    const migration = await Migration.create({
      userId: req.user._id,
      sourceUrl: sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`,
      mode,
      status: 'pending',
    });

    // Run pipeline in background (don't await)
    runAnalysisPipeline(migration._id).catch(err => {
      console.error(`[migration] Background pipeline error:`, err.message);
    });

    res.status(201).json({
      migrationId: migration._id,
      status: migration.status,
    });
  } catch (error) {
    console.error('[migration] startAnalysis error:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage de l\'analyse' });
  }
}

/**
 * GET /api/migration/:id
 * Get migration status and results
 */
export async function getStatus(req, res) {
  try {
    const migration = await Migration.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    res.json({ migration });
  } catch (error) {
    console.error('[migration] getStatus error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/migration/:id/extracted
 * Update extracted content (user edits)
 */
export async function updateExtracted(req, res) {
  try {
    const migration = await Migration.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    if (req.body.extractedContent) {
      migration.extractedContent = { ...migration.extractedContent, ...req.body.extractedContent };
    }
    if (req.body.designStyle) {
      migration.designStyle = req.body.designStyle;
    }

    await migration.save();
    res.json({ migration });
  } catch (error) {
    console.error('[migration] updateExtracted error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /api/migration/:id/map
 * Trigger content-to-section mapping
 */
export async function triggerMapping(req, res) {
  try {
    const migration = await Migration.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    if (!migration.extractedContent) {
      return res.status(400).json({ error: 'Aucun contenu extrait. Lancez d\'abord l\'analyse.' });
    }

    if (req.body.designStyle) {
      migration.designStyle = req.body.designStyle;
    }

    // Import content mapper dynamically (will be created in Phase 3)
    let mapAnalysisToSections;
    try {
      const mapper = await import('../services/content-mapper.service.js');
      mapAnalysisToSections = mapper.mapAnalysisToSections;
    } catch {
      // Content mapper not yet implemented — return basic mapping
      migration.sectionMapping = buildBasicMapping(migration.extractedContent);
      migration.status = 'mapped';
      await migration.save();
      return res.json({ migration });
    }

    migration.status = 'mapping';
    await migration.save();

    const mapping = await mapAnalysisToSections(migration.extractedContent, {
      mode: migration.mode,
      designStyle: migration.designStyle,
    });

    migration.sectionMapping = mapping;
    migration.status = 'mapped';
    await migration.save();

    res.json({ migration });
  } catch (error) {
    console.error('[migration] triggerMapping error:', error);
    res.status(500).json({ error: 'Erreur lors du mapping' });
  }
}

/**
 * PUT /api/migration/:id/mapping
 * Update section mapping (user edits)
 */
export async function updateMapping(req, res) {
  try {
    const migration = await Migration.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    if (req.body.sectionMapping) {
      migration.sectionMapping = req.body.sectionMapping;
    }
    if (req.body.designStyle) {
      migration.designStyle = req.body.designStyle;
    }

    await migration.save();
    res.json({ migration });
  } catch (error) {
    console.error('[migration] updateMapping error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /api/migration/:id/create-site
 * Create site and pages from finalized mapping
 */
export async function createSiteFromMigration(req, res) {
  try {
    const migration = await Migration.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    if (!migration.sectionMapping?.length) {
      return res.status(400).json({ error: 'Aucun mapping de sections. Lancez d\'abord le mapping.' });
    }

    migration.status = 'creating';
    migration.currentStep = 'Création du site...';
    await migration.save();

    // Import models
    const Site = (await import('../models/Site.js')).default;
    const Page = (await import('../models/Page.js')).default;
    const slugify = (await import('slugify')).default;

    const { extractedContent, sectionMapping, designStyle } = migration;
    const siteName = req.body.name || extractedContent.businessName || 'Mon site';
    const slug = slugify(siteName, { lower: true, strict: true });

    // Design style presets
    const STYLE_PRESETS = {
      modern:   { fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 'rounded' },
      bold:     { fontHeading: 'Montserrat', fontBody: 'Open Sans', borderRadius: 'rounded' },
      elegant:  { fontHeading: 'Playfair Display', fontBody: 'Lora', borderRadius: 'square' },
      minimal:  { fontHeading: 'Inter', fontBody: 'Roboto', borderRadius: 'square' },
      artistic: { fontHeading: 'Raleway', fontBody: 'Nunito', borderRadius: 'rounded' },
    };
    const preset = STYLE_PRESETS[designStyle] || STYLE_PRESETS.modern;

    // Create site
    const site = await Site.create({
      name: siteName,
      slug: `${slug}-${Date.now().toString(36)}`,
      domain: req.body.domain || undefined,
      sourceUrl: migration.sourceUrl,
      designStyle: designStyle || 'modern',
      business: {
        name: extractedContent.businessName,
        activity: extractedContent.businessType,
        description: extractedContent.description,
        city: '',
        phone: extractedContent.contactInfo?.phone || '',
        email: extractedContent.contactInfo?.email || '',
        address: extractedContent.contactInfo?.address || '',
      },
      design: {
        primaryColor: extractedContent.colors?.primary || '#12203e',
        accentColor: extractedContent.colors?.accent || '#c8a97e',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontHeading: preset.fontHeading,
        fontBody: preset.fontBody,
        borderRadius: preset.borderRadius,
      },
      seoDefaults: {
        titleSuffix: ` | ${siteName}`,
        defaultDescription: extractedContent.seo?.description || extractedContent.description || '',
        defaultKeywords: extractedContent.seo?.keywords || [],
      },
      status: 'draft',
    });

    // Create homepage with mapped sections
    const page = await Page.create({
      siteId: site._id,
      title: siteName,
      slug: 'index',
      type: 'homepage',
      isMainHomepage: true,
      seo: {
        title: extractedContent.seo?.title || `${siteName}${extractedContent.businessType ? ' — ' + extractedContent.businessType : ''}`,
        description: extractedContent.seo?.description || extractedContent.description || '',
        keywords: extractedContent.seo?.keywords || [],
      },
      sections: sectionMapping.map((s, i) => ({
        type: s.sectionType,
        order: s.order ?? i,
        visible: s.visible !== false,
        data: s.data || {},
      })),
    });

    // Create contact page
    await Page.create({
      siteId: site._id,
      title: 'Contact',
      slug: 'contact',
      type: 'contact',
      isMainHomepage: false,
      sections: [
        {
          type: 'hero',
          order: 0,
          visible: true,
          data: {
            headline: `Contactez ${extractedContent.businessName || siteName}`,
            subheadline: 'Nous sommes à votre écoute',
            ctaText: extractedContent.contactInfo?.phone
              ? `Appelez le ${extractedContent.contactInfo.phone}`
              : 'Envoyez-nous un message',
            ctaUrl: extractedContent.contactInfo?.phone
              ? `tel:${extractedContent.contactInfo.phone.replace(/\s/g, '')}`
              : '#',
          },
        },
        {
          type: 'map',
          order: 1,
          visible: true,
          data: {
            title: extractedContent.businessName || siteName,
            body: extractedContent.contactInfo?.address || '',
            hours: '',
          },
        },
      ],
    });

    // Update migration
    migration.siteId = site._id;
    migration.status = 'done';
    migration.currentStep = 'Site créé !';
    migration.progress = 100;
    await migration.save();

    // Trigger build
    try {
      const buildController = await import('./buildController.js');
      // Build will be triggered by the frontend after redirect
    } catch {}

    // Cleanup screenshots
    cleanupScreenshots(migration._id).catch(() => {});

    res.json({
      migration,
      site: { _id: site._id, slug: site.slug, name: site.name },
    });
  } catch (error) {
    console.error('[migration] createSite error:', error);

    try {
      await Migration.findByIdAndUpdate(req.params.id, {
        status: 'error',
        error: error.message,
      });
    } catch {}

    res.status(500).json({ error: 'Erreur lors de la création du site' });
  }
}

/**
 * DELETE /api/migration/:id
 * Cancel and cleanup
 */
export async function cancelMigration(req, res) {
  try {
    const migration = await Migration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!migration) {
      return res.status(404).json({ error: 'Migration non trouvée' });
    }

    cleanupScreenshots(migration._id).catch(() => {});

    res.json({ success: true });
  } catch (error) {
    console.error('[migration] cancel error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Basic section mapping when content-mapper service is not yet available
 */
function buildBasicMapping(content) {
  const sections = [];
  let order = 0;
  const phone = content.contactInfo?.phone || '';
  const phoneDisplay = phone ? phone.replace(/(\d{2})(?=\d)/g, '$1 ') : '';

  // Hero
  sections.push({
    sectionType: 'hero', order: order++, visible: true,
    data: {
      headline: content.tagline || content.businessName || 'Bienvenue',
      subheadline: content.description || '',
      ctaText: phone ? `Appelez le ${phoneDisplay}` : 'Contactez-nous',
      ctaUrl: 'contact.html',
      bulletPoints: (content.services || []).slice(0, 4).map(s => ({ value: s.title })),
    },
  });

  // Services
  if (content.services?.length) {
    sections.push({
      sectionType: 'services', order: order++, visible: true,
      data: {
        title: 'Nos services',
        subtitle: content.businessType ? `Nos prestations de ${content.businessType}` : '',
        services: content.services.slice(0, 6).map(s => ({ name: s.title, shortDescription: s.description || '' })),
      },
    });
  }

  // About
  if (content.description) {
    sections.push({
      sectionType: 'about', order: order++, visible: true,
      data: {
        title: content.businessName || 'Notre activité',
        body: `<p>${content.description}</p>`,
        bulletPoints: [],
        ctaText: 'En savoir plus', ctaUrl: 'contact.html',
      },
    });
  }

  // CTA
  sections.push({
    sectionType: 'cta', order: order++, visible: true,
    data: {
      text: `Besoin de ${content.businessType || 'nos services'} ?`,
      ctaText: 'Contactez-nous', ctaUrl: 'contact.html', bannerStyle: 'dark',
    },
  });

  // Contact
  sections.push({
    sectionType: 'contact', order: order++, visible: true,
    data: {
      title: content.businessName || 'Nous contacter',
      body: '', address: content.contactInfo?.address || '',
      phone: phone, email: content.contactInfo?.email || '', hours: '', embedUrl: '',
    },
  });

  return sections;
}

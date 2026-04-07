/**
 * Content Mapper Service
 *
 * Maps the normalized extractedContent (from vision analysis or text scraping)
 * to universal 9-block section structures for the Page model.
 *
 * Universal types: hero, services, about, testimonials, faq, google-reviews, contact, cta, team
 */

/**
 * Suggest a design style based on business type
 */
export function suggestDesignStyle(businessType) {
  const type = (businessType || '').toLowerCase();

  if (/restaurant|hotel|hôtel|gastronomie|traiteur|luxe|bijou|horlog/.test(type)) return 'elegant';
  if (/agence|agency|startup|tech|digital|marketing|créati/.test(type)) return 'bold';
  if (/portfolio|photograph|artist|design|architect/.test(type)) return 'artistic';
  if (/consultant|médic|medical|avocat|juridique|cabinet|comptab/.test(type)) return 'minimal';
  return 'modern';
}

/**
 * Map extracted content to universal page sections.
 *
 * @param {Object} extractedContent - Normalized content from migration
 * @param {Object} options - { mode: 'faithful'|'modernize', designStyle: string }
 * @returns {Array} Section mapping array for the Page model
 */
export async function mapAnalysisToSections(extractedContent, options = {}) {
  const { mode = 'faithful' } = options;
  const c = extractedContent || {};

  // If modernize mode, rewrite content via AI
  let content = c;
  if (mode === 'modernize') {
    try {
      content = await modernizeContent(c);
    } catch (err) {
      console.warn('[content-mapper] Modernize failed, using original:', err.message);
      content = c;
    }
  }

  const sections = [];
  let order = 0;

  const phone = content.contactInfo?.phone || '';
  const phoneDisplay = phone ? phone.replace(/(\d{2})(?=\d)/g, '$1 ') : '';
  const cta = phone ? `Appelez le ${phoneDisplay}` : 'Contactez-nous';
  const ctaUrl = 'contact.html';

  // 1. Hero — always present
  sections.push({
    sectionType: 'hero',
    order: order++,
    visible: true,
    data: {
      headline: content.tagline || content.businessName || 'Bienvenue',
      subheadline: content.description || '',
      ctaText: cta,
      ctaUrl,
      bulletPoints: (content.services || []).slice(0, 4).map(s => ({ value: s.title })),
    },
  });

  // 2. Services (if detected)
  if (content.services?.length) {
    sections.push({
      sectionType: 'services',
      order: order++,
      visible: true,
      data: {
        title: 'Nos services',
        subtitle: content.businessType
          ? `Découvrez nos prestations de ${content.businessType}`
          : '',
        services: content.services.slice(0, 6).map(s => ({
          name: s.title || 'Service',
          shortDescription: s.description || '',
          linkUrl: '',
        })),
      },
    });
  }

  // 3. About
  sections.push({
    sectionType: 'about',
    order: order++,
    visible: true,
    data: {
      title: content.businessName ? `À propos de ${content.businessName}` : 'À propos',
      body: content.description
        ? `<p>${content.description}</p>`
        : '<p>Notre entreprise vous accompagne avec professionnalisme et passion.</p>',
      bulletPoints: (content.services || []).slice(0, 4).map(s => ({ value: s.title })),
      ctaText: cta,
      ctaUrl,
    },
  });

  // 4. Testimonials (hidden by default — no real data from scraping)
  sections.push({
    sectionType: 'testimonials',
    order: order++,
    visible: false,
    data: {
      title: 'Ce que disent nos clients',
      items: [
        { name: 'Client 1', location: '', rating: 5, text: 'Excellent service, je recommande.' },
        { name: 'Client 2', location: '', rating: 5, text: 'Très professionnel et à l\'écoute.' },
        { name: 'Client 3', location: '', rating: 5, text: 'Résultat au-delà de nos attentes.' },
      ],
    },
  });

  // 5. FAQ (hidden by default)
  sections.push({
    sectionType: 'faq',
    order: order++,
    visible: false,
    data: {
      title: 'Questions fréquentes',
      items: [
        { question: 'Quels services proposez-vous ?', answer: content.description || 'Contactez-nous pour en savoir plus.' },
        { question: 'Comment nous contacter ?', answer: phone ? `Appelez-nous au ${phoneDisplay} ou utilisez notre formulaire de contact.` : 'Utilisez notre formulaire de contact.' },
      ],
    },
  });

  // 6. Google Reviews (hidden by default unless data available)
  sections.push({
    sectionType: 'google-reviews',
    order: order++,
    visible: false,
    data: {
      title: 'Avis Google',
      reviewCount: 0,
      rating: 5,
      ctaText: 'Voir nos avis',
      ctaUrl: '',
      testimonials: [],
    },
  });

  // 7. Team (hidden by default)
  sections.push({
    sectionType: 'team',
    order: order++,
    visible: false,
    data: {
      title: 'Notre équipe',
      body: '',
      members: [],
    },
  });

  // 8. CTA
  sections.push({
    sectionType: 'cta',
    order: order++,
    visible: true,
    data: {
      text: content.businessType
        ? `Besoin d'un professionnel en ${content.businessType} ?`
        : 'Prêt à démarrer votre projet ?',
      ctaText: 'Contactez-nous',
      ctaUrl,
      bannerStyle: 'dark',
    },
  });

  // 9. Contact
  sections.push({
    sectionType: 'contact',
    order: order++,
    visible: true,
    data: {
      title: content.businessName || 'Nous contacter',
      body: content.contactInfo?.address || '',
      address: content.contactInfo?.address || '',
      phone: content.contactInfo?.phone || '',
      email: content.contactInfo?.email || '',
      hours: '',
      embedUrl: '',
    },
  });

  return sections;
}

/**
 * Use AI to rewrite/improve extracted content (modernize mode)
 */
async function modernizeContent(content) {
  try {
    const { generatePageContent } = await import('./ai.service.js');

    const site = {
      business: {
        name: content.businessName || '',
        activity: content.businessType || '',
        description: content.description || '',
        city: '',
        phone: content.contactInfo?.phone || '',
        email: content.contactInfo?.email || '',
        services: (content.services || []).map(s => s.title).join(', '),
        uniqueSellingPoints: '',
      },
      name: content.businessName || 'Mon site',
    };

    const pageConfig = {
      keyword: content.businessType || content.businessName || '',
      serviceFocus: (content.services || [])[0]?.title || '',
      tone: 'professionnel et chaleureux',
    };

    const aiContent = await generatePageContent(site, pageConfig);

    return {
      ...content,
      description: aiContent.description?.body?.replace(/<[^>]*>/g, '') || content.description,
      tagline: aiContent.hero?.headline || content.tagline,
      services: aiContent.servicesGrid?.services?.map(s => ({
        title: s.name || s.title,
        description: s.shortDescription || s.description || '',
      })) || content.services,
      _aiContent: aiContent,
    };
  } catch (err) {
    console.error('[content-mapper] AI modernize error:', err.message);
    throw err;
  }
}

export default { mapAnalysisToSections, suggestDesignStyle };

/**
 * Shared AI page building utilities.
 * Maps AI-generated content to the universal 9-block section schema.
 *
 * Universal section types:
 * hero, services, about, testimonials, faq, google-reviews, contact, cta, team
 */

/**
 * Map AI-generated content to page sections (universal schema).
 * @param {Array} sections - Page sections from DB (with .type and .data)
 * @param {Object} content - AI response content object
 * @param {Object} options - { otherPages, currentPageIndex, googleReviewsData, siteBusiness }
 * @returns {Array} Updated sections with AI content merged
 */
export function mapAiContentToSections(sections, content, options = {}) {
  const { otherPages = [], currentPageIndex = 0, googleReviewsData, siteBusiness } = options;

  return sections.map(s => {
    const sData = { ...s };
    switch (s.type) {
      case 'hero':
        if (content.hero) sData.data = { ...s.data, ...content.hero };
        // Absorb textHighlight into subheadline if available
        if (content.textHighlight?.text && !sData.data.subheadline) {
          sData.data.subheadline = content.textHighlight.text;
        }
        break;

      case 'services':
        if (content.servicesGrid) sData.data = { ...s.data, ...content.servicesGrid };
        {
          const aiServices = content.servicesGrid?.services || [];
          // Only override with otherPages links if there are other pages
          if (otherPages.length > 0) {
            const allServices = otherPages.map(op => {
              const name = op.serviceFocus || op.keyword || op.title;
              const nameLower = name.toLowerCase();
              const aiMatch = aiServices.find(a => a.name && (nameLower.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(nameLower)));
              return {
                name,
                shortDescription: aiMatch?.shortDescription || aiMatch?.description || '',
                linkUrl: op.href,
              };
            });
            if (allServices.length <= 4) {
              sData.data.services = allServices;
            } else {
              const offset = currentPageIndex % allServices.length;
              const rotated = [...allServices.slice(offset), ...allServices.slice(0, offset)];
              sData.data.services = rotated.slice(0, 4);
            }
          }
          // else: keep AI-generated services as-is
        }
        break;

      case 'about':
        // Merge description + whyUs into about
        if (content.description) sData.data = { ...s.data, ...content.description };
        if (content.whyUs) {
          // Merge whyUs reasons as bullet points
          if (content.whyUs.reasons?.length) {
            const existingBullets = sData.data.bulletPoints || [];
            const reasonBullets = content.whyUs.reasons.map(r => ({ value: `${r.title} — ${r.text}` }));
            sData.data.bulletPoints = [...existingBullets, ...reasonBullets];
          }
          if (!sData.data.title && content.whyUs.title) sData.data.title = content.whyUs.title;
          if (!sData.data.body && content.whyUs.body) sData.data.body = content.whyUs.body;
        }
        break;

      case 'google-reviews':
        if (content.googleReviews) {
          sData.data = { ...s.data, ...content.googleReviews };
          if (googleReviewsData?.reviews?.length) {
            const aiReviews = (sData.data.testimonials || []).map(t => ({ ...t, isGoogle: false }));
            sData.data.testimonials = [...aiReviews, ...googleReviewsData.reviews];
            sData.data.reviewCount = googleReviewsData.totalReviews;
            sData.data.rating = googleReviewsData.rating;
            sData.data.ctaText = `Voir nos ${googleReviewsData.totalReviews}+ avis`;
            sData.data.ctaUrl = googleReviewsData.googleMapsUri || siteBusiness?.googleReviewUrl || '';
          } else {
            if (siteBusiness?.googleReviewCount) sData.data.reviewCount = parseInt(siteBusiness.googleReviewCount);
            if (siteBusiness?.googleReviewRating) sData.data.rating = parseFloat(siteBusiness.googleReviewRating);
            if (siteBusiness?.googleReviewUrl) sData.data.ctaUrl = siteBusiness.googleReviewUrl;
          }
        }
        break;

      case 'cta':
        if (content.ctaBanner) sData.data = { ...s.data, ...content.ctaBanner };
        break;

      case 'testimonials':
        if (content.testimonials?.items) sData.data = { ...s.data, items: content.testimonials.items };
        else if (Array.isArray(content.testimonials)) sData.data = { ...s.data, items: content.testimonials };
        break;

      case 'faq':
        if (content.faq?.items) sData.data = { ...s.data, items: content.faq.items };
        else if (Array.isArray(content.faq)) sData.data = { ...s.data, items: content.faq };
        break;

      case 'team':
        if (content.team) sData.data = { ...s.data, ...content.team };
        break;

      case 'contact':
        if (content.map) sData.data = { ...s.data, ...content.map, address: s.data.address, phone: s.data.phone, email: s.data.email };
        break;

      // Legacy types — handle gracefully during migration
      case 'services-grid':
        if (content.servicesGrid) sData.data = { ...s.data, ...content.servicesGrid };
        break;
      case 'description':
        if (content.description) sData.data = { ...s.data, ...content.description };
        break;
      case 'why-us':
        if (content.whyUs) sData.data = { ...s.data, ...content.whyUs };
        break;
      case 'cta-banner':
        if (content.ctaBanner) sData.data = { ...s.data, ...content.ctaBanner };
        break;
      case 'map':
        if (content.map) sData.data = { ...s.data, ...content.map, address: s.data.address, phone: s.data.phone, email: s.data.email };
        break;
      case 'text-highlight':
        if (content.textHighlight) sData.data = { ...s.data, ...content.textHighlight };
        break;
      case 'guarantee':
        if (content.guarantee) sData.data = { ...s.data, ...content.guarantee };
        break;

    }
    return sData;
  });
}

/**
 * Map AI-generated city page content to sections.
 */
export function mapCityAiContentToSections(sections, content) {
  return sections.map(s => {
    const sData = { ...s };
    switch (s.type) {
      case 'hero':
        if (content.hero) sData.data = { ...s.data, ...content.hero };
        break;
      case 'about':
      case 'city-about':
        if (content.cityAbout) sData.data = { ...s.data, ...content.cityAbout };
        break;
      case 'cta':
      case 'cta-banner':
        if (content.ctaBanner) sData.data = { ...s.data, ...content.ctaBanner };
        break;
    }
    return sData;
  });
}

/**
 * Map AI-generated booking page content to sections.
 */
export function mapBookingAiContentToSections(sections, content) {
  return sections.map(s => {
    const sData = { ...s };
    switch (s.type) {
      case 'hero-practitioner':
        if (content.heroPractitioner) sData.data = { ...s.data, ...content.heroPractitioner };
        break;
      case 'services-booking':
        if (content.servicesBooking) sData.data = { ...s.data, ...content.servicesBooking };
        break;
      case 'about':
        if (content.about) sData.data = { ...s.data, ...content.about };
        break;
      case 'testimonials': {
        let items = content.testimonials?.items || (Array.isArray(content.testimonials) ? content.testimonials : null);
        if (items) {
          items = items.map(t => ({
            author: t.author || t.name || '',
            quote: t.quote || t.text || '',
            role: t.role || t.location || '',
            rating: t.rating,
          }));
          sData.data = { ...s.data, items };
        }
        break;
      }
      case 'google-reviews':
        if (content.googleReviews) {
          // Normalize testimonial fields (name → author, text → quote)
          const items = content.googleReviews.testimonials || [];
          const normalized = items.map(t => ({
            author: t.author || t.name || '',
            quote: t.quote || t.text || '',
            text: t.text || '',
            role: t.role || t.location || '',
            rating: t.rating || 5,
          }));
          sData.data = { ...s.data, ...content.googleReviews, testimonials: normalized };
        }
        break;
      case 'faq':
        if (content.faq?.items) sData.data = { ...s.data, items: content.faq.items };
        else if (Array.isArray(content.faq)) sData.data = { ...s.data, items: content.faq };
        break;
      case 'contact':
        if (content.contact) sData.data = { ...s.data, ...content.contact, address: s.data.address, phone: s.data.phone, email: s.data.email };
        break;
      case 'booking-widget':
        // Keep calendarSlug from DB, don't override with AI
        break;
    }
    return sData;
  });
}

/**
 * Distribute images cyclically across sections.
 * @param {Array} sections - Page sections
 * @param {Array} mediaIds - Array of media ObjectId strings
 * @param {number} pageIndex - Page index for cyclic offset
 * @returns {Array} Sections with media IDs assigned
 */
export function distributeImagesToSections(sections, mediaIds, pageIndex = 0) {
  if (!mediaIds.length) return sections;

  const n = mediaIds.length;
  let cursor = (pageIndex * 2) % n;
  const next = () => { const id = mediaIds[cursor % n]; cursor++; return id; };

  return sections.map(s => {
    const sData = { ...s };
    if (s.type === 'hero' && !s.data.backgroundMediaId) {
      sData.data = { ...s.data, backgroundMediaId: next() };
    }
    if (s.type === 'hero-practitioner' && !s.data.photoMediaId) {
      sData.data = { ...s.data, photoMediaId: next() };
    }
    if ((s.type === 'about' || s.type === 'description' || s.type === 'city-about') && !s.data.imageMediaId) {
      sData.data = { ...s.data, imageMediaId: next() };
    }
    if (s.type === 'team' && !s.data.imageMediaId) {
      sData.data = { ...s.data, imageMediaId: next() };
    }
    if ((s.type === 'services' || s.type === 'services-grid') && s.data.services) {
      sData.data = { ...s.data, services: s.data.services.map(svc => ({
        ...svc,
        imageMediaId: svc.imageMediaId || next(),
      })) };
    }
    return sData;
  });
}

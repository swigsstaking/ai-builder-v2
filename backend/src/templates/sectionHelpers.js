/**
 * Universal section helpers for V1 templates.
 * Provides a consistent interface for accessing section data
 * from the universal 9-block schema.
 */

/**
 * Find a visible section by type from the sections array.
 * @param {Array} sections - Array of { type, visible, data, style, order }
 * @param {string} type - Section type to find
 * @returns {{ data: object, style: object } | null}
 */
export function getSection(sections, type) {
  const section = sections?.find(s => s.type === type && s.visible !== false);
  return section || null;
}

/**
 * Get section data with defaults.
 * @param {Array} sections - Sections array
 * @param {string} type - Section type
 * @param {object} defaults - Default values
 * @returns {object} Section data merged with defaults
 */
export function getSectionData(sections, type, defaults = {}) {
  const section = getSection(sections, type);
  return section ? { ...defaults, ...section.data } : defaults;
}

/**
 * Check if a section should be visible.
 * Supports both the new sections array format AND the legacy visibleSections object.
 */
export function isSectionVisible(sections, type, visibleSections) {
  // New format: check sections array
  if (Array.isArray(sections)) {
    const section = sections.find(s => s.type === type);
    return section ? section.visible !== false : false;
  }
  // Legacy format: check visibleSections object
  if (visibleSections) {
    return visibleSections[type] !== false;
  }
  return true;
}

/**
 * Get sorted visible sections for rendering in order.
 * @param {Array} sections - Sections array
 * @returns {Array} Sorted visible sections
 */
export function getVisibleSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Build a media URL from a mediaId field.
 * In the preview context, images are served from /api/build/:siteId/preview/images/
 * In the SSG context, images are relative: images/filename.webp
 * @param {string} mediaId - The media object ID or resolved URL
 * @returns {string} Image URL or empty string
 */
export function getMediaUrl(mediaId) {
  if (!mediaId) return '';
  // If it's already a URL (resolved by backend), return as-is
  if (typeof mediaId === 'string' && (mediaId.startsWith('http') || mediaId.startsWith('images/'))) {
    return mediaId;
  }
  // Otherwise it's a raw ObjectId — the backend resolves these before rendering
  return '';
}

/**
 * Auto-contrast: returns white or dark text color based on background luminance.
 * @param {string} hexBg - Background color in hex (#RRGGBB)
 * @returns {string} '#ffffff' for dark backgrounds, '#1a1a1a' for light backgrounds
 */
export function getContrastText(hexBg) {
  if (!hexBg || hexBg.length < 7) return '#1a1a1a';
  const h = hexBg.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)
            + 0.7152 * (g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4)
            + 0.0722 * (b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4);
  return lum > 0.35 ? '#1a1a1a' : '#ffffff';
}

/**
 * Star rating component helper.
 * @param {number} rating - Rating value (0-5)
 * @returns {Array} Array of star states ('full' | 'half' | 'empty')
 */
export function getStarRating(rating) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) stars.push('full');
    else if (i - 0.5 === rounded) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

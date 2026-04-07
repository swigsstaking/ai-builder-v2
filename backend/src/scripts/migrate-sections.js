/**
 * Migration script: Convert old Resamatic section types to the universal 9-block schema.
 *
 * Old types (15): hero, text-highlight, description, why-us, google-reviews, cta-banner,
 *   services-grid, guarantee, testimonials, faq, team, map, city-about, city-guarantee, city-reviews
 *
 * New types (9): hero, services, about, testimonials, faq, google-reviews, contact, cta, team
 *
 * Usage: node src/scripts/migrate-sections.js [--dry-run]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MIGRATION_MAP = {
  // Direct renames
  'services-grid': 'services',
  'cta-banner': 'cta',
  'map': 'contact',
  'city-about': 'about',
  'city-reviews': 'google-reviews',

  // Types that stay the same
  'hero': 'hero',
  'testimonials': 'testimonials',
  'faq': 'faq',
  'google-reviews': 'google-reviews',
  'team': 'team',

  // Types to merge into 'about'
  'description': 'about',
  'why-us': 'about',

  // Types to remove (absorbed into other sections)
  'text-highlight': null,
  'guarantee': null,
  'city-guarantee': null,
};

const dryRun = process.argv.includes('--dry-run');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const pages = db.collection('pages');

  const allPages = await pages.find({ 'sections.type': { $exists: true } }).toArray();
  console.log(`Found ${allPages.length} pages to check`);

  let pagesUpdated = 0;
  let sectionsRenamed = 0;
  let sectionsRemoved = 0;
  let sectionsMerged = 0;

  for (const page of allPages) {
    let modified = false;
    const newSections = [];
    let aboutSection = null;

    // First pass: find existing 'about' section or create one for merges
    for (const section of page.sections) {
      if (section.type === 'about' || section.type === 'description') {
        if (!aboutSection) aboutSection = { ...section, type: 'about' };
      }
    }

    for (const section of page.sections) {
      const oldType = section.type;
      const newType = MIGRATION_MAP[oldType];

      if (newType === undefined) {
        // Unknown type — keep as-is
        newSections.push(section);
        continue;
      }

      if (newType === null) {
        // Remove this section
        sectionsRemoved++;
        modified = true;
        console.log(`  [${page.title}] REMOVE: ${oldType}`);
        continue;
      }

      if (oldType === 'why-us' && aboutSection) {
        // Merge why-us data into the about section
        if (section.data?.reasons?.length) {
          const extraBullets = section.data.reasons.map(r => ({ value: `${r.title} — ${r.text}` }));
          aboutSection.data = aboutSection.data || {};
          aboutSection.data.bulletPoints = [...(aboutSection.data.bulletPoints || []), ...extraBullets];
        }
        sectionsMerged++;
        modified = true;
        console.log(`  [${page.title}] MERGE: ${oldType} → about (${section.data?.reasons?.length || 0} reasons)`);
        continue;
      }

      if (oldType === 'description' && newType === 'about') {
        // This becomes the about section (already handled above)
        if (!aboutSection || aboutSection === section) {
          newSections.push({ ...section, type: 'about' });
        }
        if (oldType !== newType) {
          sectionsRenamed++;
          modified = true;
          console.log(`  [${page.title}] RENAME: ${oldType} → ${newType}`);
        }
        continue;
      }

      if (oldType !== newType) {
        sectionsRenamed++;
        modified = true;
        console.log(`  [${page.title}] RENAME: ${oldType} → ${newType}`);
      }

      newSections.push({ ...section, type: newType });
    }

    if (modified) {
      // Re-order sections
      newSections.forEach((s, i) => { s.order = i; });

      if (!dryRun) {
        await pages.updateOne(
          { _id: page._id },
          { $set: { sections: newSections } }
        );
      }
      pagesUpdated++;
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Pages updated: ${pagesUpdated}`);
  console.log(`Sections renamed: ${sectionsRenamed}`);
  console.log(`Sections merged: ${sectionsMerged}`);
  console.log(`Sections removed: ${sectionsRemoved}`);
  if (dryRun) console.log('(DRY RUN — no changes written)');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

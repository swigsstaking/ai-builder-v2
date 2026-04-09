import mongoose from 'mongoose';

const migrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  sourceUrl: { type: String, required: true, trim: true },
  mode: { type: String, enum: ['faithful', 'modernize'], default: 'faithful' },
  status: {
    type: String,
    enum: ['pending', 'capturing', 'analyzing', 'analyzed', 'mapping', 'mapped', 'creating', 'done', 'error'],
    default: 'pending',
  },

  // Raw analysis from whichever AI provider succeeded
  analysisResult: { type: mongoose.Schema.Types.Mixed },
  analysisProvider: { type: String, enum: ['qwen3-vl', 'claude-vision', 'text-scraping', 'agenda-ch'] },

  // Normalized extracted content
  extractedContent: {
    businessName: String,
    businessType: String,
    description: String,
    tagline: String,
    contactInfo: {
      phone: String,
      email: String,
      address: String,
      city: String,
    },
    services: [{ title: String, description: String }],
    colors: {
      primary: String,
      secondary: String,
      accent: String,
    },
    googleMapsUrl: String,
    externalWebsite: String,
    agendaCompanyId: String,
    fonts: {
      body: String,
      heading: String,
      googleFonts: [String],
    },
    designStyle: String,
    detectedSections: [String],
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },

  // Section mapping (proposed, then user-edited)
  sectionMapping: [{
    sectionType: String,
    order: Number,
    visible: { type: Boolean, default: true },
    data: mongoose.Schema.Types.Mixed,
  }],

  designStyle: {
    type: String,
    enum: ['modern', 'bold', 'elegant', 'minimal', 'artistic'],
    default: 'modern',
  },

  // Screenshots stored temporarily
  screenshots: [{
    page: String,
    filename: String,
    size: Number,
  }],

  error: String,
  currentStep: String,
  progress: { type: Number, default: 0 },
}, { timestamps: true });

migrationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Migration', migrationSchema);

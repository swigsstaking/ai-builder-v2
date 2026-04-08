import axios from 'axios';

const VISION_URL = process.env.VISION_AI_URL || process.env.AI_API_URL || 'http://192.168.110.103:11434';
const OCR_MODEL = process.env.VISION_OCR_MODEL || 'deepseek-ocr';
const STRUCT_MODEL = process.env.VISION_STRUCT_MODEL || 'qwen3.5:9b';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const OCR_TIMEOUT = 20000;    // 20s per image — deepseek-ocr is fast
const STRUCT_TIMEOUT = 60000; // 60s for structuring all text
const OCR_CONCURRENCY = 3;    // match OLLAMA_NUM_PARALLEL

/**
 * Clean base64 string (remove newlines)
 */
const cleanBase64 = (buffer) => Buffer.from(buffer).toString('base64');

/**
 * Parse JSON from AI response, with repair for truncated output
 */
function parseJson(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = (match ? match[1] : text).trim();

  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) jsonStr = objMatch[0];

  try {
    return JSON.parse(jsonStr);
  } catch (firstErr) {
    let repaired = jsonStr.replace(/,\s*$/, '');
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';
    try {
      const result = JSON.parse(repaired);
      console.warn('[vision] JSON was truncated but successfully repaired');
      return result;
    } catch {
      console.error('[vision] JSON repair failed, raw text:', jsonStr.slice(0, 500));
      throw firstErr;
    }
  }
}

// ─── Step 1: Fast OCR with deepseek-ocr ───

/**
 * Run OCR on a single screenshot using deepseek-ocr (~3s per image)
 */
async function ocrSingleImage(imageBase64, pageName) {
  const response = await axios.post(`${VISION_URL}/api/generate`, {
    model: OCR_MODEL,
    prompt: '<image>OCR the text in this image.',
    images: [imageBase64],
    stream: false,
    options: { num_predict: 2048 },
  }, {
    timeout: OCR_TIMEOUT,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: { 'Content-Type': 'application/json' },
  });

  const text = response.data.response || '';
  console.log(`[vision] OCR ${pageName}: ${text.length} chars in ${(response.data.total_duration / 1e9).toFixed(1)}s`);
  return text;
}

/**
 * Run OCR on all screenshots in parallel batches of OCR_CONCURRENCY.
 * Matches OLLAMA_NUM_PARALLEL for optimal throughput.
 */
async function ocrAllScreenshots(screenshots) {
  const results = [];
  const items = screenshots.map(s => ({
    pageName: s.pageName || s.page || '/',
    image: cleanBase64(s.screenshot),
  }));

  // Process in batches
  for (let i = 0; i < items.length; i += OCR_CONCURRENCY) {
    const batch = items.slice(i, i + OCR_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(({ pageName, image }) =>
        ocrSingleImage(image, pageName)
          .then(text => ({ page: pageName, text }))
          .catch(err => {
            console.warn(`[vision] OCR failed for ${pageName}: ${err.message}`);
            return { page: pageName, text: '' };
          })
      )
    );
    results.push(...batchResults);
  }

  return results;
}

// ─── Step 2: Structure OCR text with a text LLM ───

/**
 * Build the structuring prompt from all OCR results
 */
function buildStructuringPrompt(domain, ocrResults) {
  const pages = ocrResults
    .filter(r => r.text.length > 20)
    .map(r => `=== PAGE: ${r.page} ===\n${r.text}`)
    .join('\n\n');

  return `From this OCR text extracted from ${domain}, create a complete JSON analysis.
Read carefully ALL the text from each page.

${pages}

Return ONLY this JSON structure (fill ALL fields from the text above):
{
  "businessName": "exact business name from logo/header",
  "businessType": "type of business activity",
  "tagline": "main slogan/headline",
  "description": "short business description",
  "navigation": ["menu items"],
  "services": [{"title": "service name", "description": "service description"}],
  "products": [{"name": "product", "price": "price if visible", "description": ""}],
  "team": [{"name": "person name", "role": "role"}],
  "testimonials": [{"quote": "testimonial text", "author": "author name"}],
  "contactInfo": {"phone": "phone number", "email": "email", "address": "full address"},
  "openingHours": "opening hours if found",
  "detectedColors": {"primary": "#hex brand/accent color (NOT black or white)", "secondary": "#hex dark background color", "accent": "#hex secondary brand/highlight color (NOT black or white)"},
  "detectedSections": ["hero", "services", "about", "testimonials", "faq", "team", "contact", "gallery", "pricing", "cta"],
  "seo": {"title": "SEO title", "description": "meta description", "keywords": ["keyword1", "keyword2"]}
}`;
}

/**
 * Use qwen3.5 to structure OCR text into analysis JSON
 */
async function structureWithLLM(domain, ocrResults) {
  const prompt = buildStructuringPrompt(domain, ocrResults);

  console.log(`[vision] Structuring OCR from ${ocrResults.length} pages with ${STRUCT_MODEL}...`);

  const response = await axios.post(`${VISION_URL}/api/chat`, {
    model: STRUCT_MODEL,
    messages: [
      { role: 'system', content: 'You output ONLY valid JSON. No explanation, no markdown, no text before or after the JSON.' },
      { role: 'user', content: prompt },
    ],
    stream: false,
    think: false,
    options: {
      temperature: 0.1,
      num_predict: 2048,
    },
  }, {
    timeout: STRUCT_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  });

  const content = response.data.message?.content || '';
  const duration = (response.data.total_duration / 1e9).toFixed(1);
  console.log(`[vision] Structured in ${duration}s (${content.length} chars)`);

  return parseJson(content);
}

// ─── Main pipeline: OCR → Structure ───

/**
 * Analyze screenshots using local OCR pipeline:
 * 1. deepseek-ocr for fast text extraction (~3s/image)
 * 2. qwen3.5 for structuring text into JSON (~15s)
 */
async function analyzeWithLocalOCR(screenshots, domain) {
  console.log(`[vision] Local OCR pipeline: ${screenshots.length} screenshots for ${domain}`);

  // Step 1: OCR all images
  const ocrResults = await ocrAllScreenshots(screenshots);
  const validResults = ocrResults.filter(r => r.text.length > 20);

  if (validResults.length === 0) {
    throw new Error('OCR produced no usable text from any screenshot');
  }

  console.log(`[vision] OCR complete: ${validResults.length}/${screenshots.length} pages with text`);

  // Step 2: Structure the text
  const analysis = await structureWithLLM(domain, ocrResults);

  return {
    provider: 'qwen3-vl',
    domain,
    analysis,
    screenshotCount: screenshots.length,
    ocrPagesUsed: validResults.length,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── Fallback: Claude Vision ───

function buildAnalysisPrompt(domain, screenshots) {
  const pagesList = screenshots.map(s => s.page || '/').join(', ');
  return `Analyse ces ${screenshots.length} captures d'écran du site ${domain} (pages: ${pagesList}) et extrais TOUTES les informations.

Retourne un JSON avec: extractedInfo (businessName, businessType, tagline, description, navigation, services, products, team, testimonials, contactInfo, openingHours, detectedColors, detectedSections), creativeBrief (siteType, brandVoice, suggestedSections, uniqueSellingPoints), seo (title, description, keywords).`;
}

async function analyzeWithClaudeVision(screenshots, domain) {
  if (!ANTHROPIC_API_KEY) throw new Error('No Anthropic API key configured');

  console.log(`[vision] Claude Vision: Analyzing ${screenshots.length} screenshots for ${domain}`);

  const content = [];
  screenshots.slice(0, 3).forEach(s => {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: cleanBase64(s.screenshot) },
    });
  });
  content.push({ type: 'text', text: buildAnalysisPrompt(domain, screenshots) });

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    system: 'Tu es un expert OCR et analyste web. Tu extrais TOUT le texte visible des images de sites web. Tu réponds UNIQUEMENT en JSON valide.',
    messages: [{ role: 'user', content }],
    temperature: 0.2,
  }, {
    timeout: 120000,
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
  });

  const text = response.data.content[0].text;
  console.log(`[vision] Claude Vision: Response length: ${text.length} chars`);

  return {
    provider: 'claude-vision',
    domain,
    analysis: parseJson(text),
    screenshotCount: screenshots.length,
    model: ANTHROPIC_MODEL,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── Health check ───

export async function checkVisionHealth() {
  try {
    const response = await axios.get(`${VISION_URL}/api/tags`, { timeout: 5000 });
    const models = response.data?.models || [];
    const modelNames = models.map(m => m.name);
    const hasOCR = modelNames.some(n => n.includes('deepseek-ocr') || n.includes('ocr'));
    const hasStruct = modelNames.some(n => n.includes('qwen3.5') || n.includes('qwen3'));
    return { available: hasOCR && hasStruct, hasOCR, hasStruct, models: modelNames };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// ─── Main entry point ───

/**
 * Main analysis function with fallback:
 * 1. Local OCR pipeline (deepseek-ocr + qwen3.5) — fast, free
 * 2. Claude Vision — API fallback
 * 3. null — caller uses text scraping
 */
export async function analyzeScreenshots(screenshots, domain, userInfo = {}) {
  if (!screenshots?.length) {
    console.log('[vision] No screenshots to analyze');
    return null;
  }

  // Tier 1: Local OCR pipeline
  try {
    const health = await checkVisionHealth();
    if (health.available) {
      return await analyzeWithLocalOCR(screenshots, domain);
    }
    console.warn(`[vision] Local OCR not available (OCR: ${health.hasOCR}, Struct: ${health.hasStruct}), trying Claude Vision`);
  } catch (err) {
    console.warn(`[vision] Local OCR failed: ${err.message}, trying Claude Vision`);
  }

  // Tier 2: Claude Vision
  try {
    if (ANTHROPIC_API_KEY) {
      return await analyzeWithClaudeVision(screenshots, domain);
    }
    console.warn('[vision] No Anthropic API key, skipping Claude Vision');
  } catch (err) {
    console.warn(`[vision] Claude Vision failed: ${err.message}`);
  }

  console.warn('[vision] All vision providers failed');
  return null;
}

export default { analyzeScreenshots, checkVisionHealth };

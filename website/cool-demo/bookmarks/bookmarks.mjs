export const API_BASE = 'https://simple-jev-demo-api.featherless.ai/v1'

export const CATEGORIES = {
  technology_software: 'Software, programming, developer tools, cloud, security, and hardware.',
  ai_data: 'AI, machine learning, models, data science, and analytics.',
  work_productivity: 'Work tools, documents, calendars, collaboration, and career.',
  business_finance: 'Companies, markets, investing, banking, crypto, and economics.',
  news_politics: 'News, journalism, current events, politics, and public policy.',
  learning_reference: 'Tutorials, courses, documentation, reference, and explainers.',
  science_nature: 'Science, space, climate, environment, and medicine.',
  design_creative: 'Design, art, photography, writing, and creative inspiration.',
  social_communities: 'Social networks, forums, blogs, and online communities.',
  entertainment_media: 'Video, music, podcasts, movies, television, books, and culture.',
  gaming: 'Video games, game platforms, esports, and game development.',
  sports: 'Sports teams, leagues, scores, athletes, and fantasy sports.',
  shopping_products: 'Stores, products, marketplaces, reviews, and deals.',
  food_drink: 'Recipes, restaurants, cooking, drinks, and dining guides.',
  travel_local: 'Travel, maps, destinations, local businesses, and events.',
  health_fitness: 'Healthcare, fitness, nutrition, wellness, and exercise.',
  home_lifestyle: 'Home, gardening, fashion, pets, hobbies, and personal interests.',
  other: 'Anything that does not clearly fit another category.',
}

export const SAMPLE_BOOKMARKS = [
  ['GitHub Actions', 'https://github.com/features/actions'],
  ['The New York Times', 'https://www.nytimes.com/'],
  ['Hugging Face Models', 'https://huggingface.co/models'],
  ['Best banana bread recipe', 'https://www.allrecipes.com/recipe/23600/'],
  ['Google Calendar', 'https://calendar.google.com/'],
  ['The Metropolitan Museum of Art', 'https://www.metmuseum.org/'],
  ['ESPN', 'https://www.espn.com/'],
  ['Airbnb', 'https://www.airbnb.com/'],
  ['National Geographic', 'https://www.nationalgeographic.com/'],
  ['Figma', 'https://www.figma.com/'],
  ['NPR', 'https://www.npr.org/'],
  ['Wikipedia', 'https://www.wikipedia.org/'],
  ['Stripe', 'https://stripe.com/'],
  ['Reuters', 'https://www.reuters.com/'],
  ['Khan Academy', 'https://www.khanacademy.org/'],
  ['NASA', 'https://www.nasa.gov/'],
  ['Reddit', 'https://www.reddit.com/'],
  ['YouTube', 'https://www.youtube.com/'],
  ['Spotify', 'https://www.spotify.com/'],
  ['Steam', 'https://store.steampowered.com/'],
  ['Etsy', 'https://www.etsy.com/'],
  ['Tripadvisor', 'https://www.tripadvisor.com/'],
  ['Healthline', 'https://www.healthline.com/'],
  ['The Spruce', 'https://www.thespruce.com/'],
  ['The Guardian', 'https://www.theguardian.com/'],
  ['Coursera', 'https://www.coursera.org/'],
  ['Mayo Clinic', 'https://www.mayoclinic.org/'],
  ['OpenTable', 'https://www.opentable.com/'],
  ['Lowe’s', 'https://www.lowes.com/'],
  ['Vogue', 'https://www.vogue.com/'],
].map(([title, url]) => ({ title, url }))

export const MAX_BOOKMARKS = 30
export const BATCH_SIZE = 30
export const LIMITS = {
  FILE_BYTES: 5 * 1024 * 1024,
  MAX_ANCHORS_SCAN: 10_000,
  TITLE_CHARS: 180,
  URL_CHARS: 1_500,
}

export function sanitizeText(value, maxChars) {
  const text = String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.slice(0, maxChars)
}

export function validBookmarkUrl(value) {
  const raw = String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
  if (!raw || raw.length > LIMITS.URL_CHARS) return null
  try {
    const url = new URL(raw)
    if (!/^https?:$/.test(url.protocol) || url.href.length > LIMITS.URL_CHARS) return null
    return url.href
  } catch {
    return null
  }
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export function parseBookmarks(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const seen = new Set()
  const bookmarks = []
  const anchors = [...doc.querySelectorAll('a[href]')].slice(0, LIMITS.MAX_ANCHORS_SCAN)
  for (const anchor of anchors) {
    const url = validBookmarkUrl(anchor.getAttribute('href'))
    if (!url || seen.has(url)) continue
    seen.add(url)
    const title = sanitizeText(anchor.textContent, LIMITS.TITLE_CHARS) || hostOf(url)
    bookmarks.push({ title, url })
  }
  return bookmarks
}

export function buildRequest(model, bookmarks) {
  if (!bookmarks.length || bookmarks.length > BATCH_SIZE) throw Error('Choose between 1 and 30 bookmarks.')
  const state = bookmarks.map((bookmark, index) =>
    `Bookmark ${index + 1}: ${bookmark.title} — ${bookmark.url}`,
  ).join('\n')
  const questions = Object.fromEntries(bookmarks.map((bookmark, index) => [
    `bookmark_${index + 1}`,
    {
      type: 'choice',
      instructions: `Which single category best fits Bookmark ${index + 1}? Judge the bookmark itself, not its URL host.`,
      criteria: CATEGORIES,
    },
  ]))
  return { model, state, questions }
}

export function answerFor(data, id) {
  const answer = data?.answers?.[id]
  if (!answer || !Object.hasOwn(CATEGORIES, answer.choice)) throw Error('The API returned an invalid category.')
  const probabilities = answer.probabilities
  if (!probabilities || !Object.keys(CATEGORIES).every((key) => Number.isFinite(probabilities[key]))) {
    throw Error('The API returned incomplete category probabilities.')
  }
  return answer
}

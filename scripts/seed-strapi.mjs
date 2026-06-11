#!/usr/bin/env node
/**
 * VBake4U — Strapi seed script
 * Populates: Global, Categories, Cakes, Testimonials, Occasions
 *
 * Usage:
 *   STRAPI_URL=https://your-railway-url.railway.app \
 *   STRAPI_TOKEN=<full-access API token from Strapi Admin → Settings → API Tokens> \
 *   node scripts/seed-strapi.mjs
 *
 * For a fresh local dev run:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<token> node scripts/seed-strapi.mjs
 *
 * Notes:
 *   - Script is idempotent: it skips entries whose slug already exists.
 *   - Cakes need publishedAt set because draftAndPublish is enabled on the Cake type.
 *   - Images must be uploaded separately via the Strapi Media Library UI or
 *     the /api/upload endpoint (multipart). See "Uploading images" section below.
 */

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌  STRAPI_TOKEN is required.');
  console.error('    Create a Full Access token: Strapi Admin → Settings → API Tokens → Create new token');
  process.exit(1);
}

// ─── API helpers ────────────────────────────────────────────────────────────

async function req(method, path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json?.error ?? json)}`);
  }
  return json;
}

async function create(endpoint, data) {
  const res = await req('POST', `/api/${endpoint}`, { data });
  return res.data; // { id, documentId, ...fields }
}

async function findBySlug(endpoint, slug) {
  const res = await req('GET', `/api/${endpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`);
  return res.data?.[0] ?? null;
}

async function updateSingle(endpoint, data) {
  const res = await req('PUT', `/api/${endpoint}`, { data });
  return res.data;
}

function log(emoji, msg) {
  process.stdout.write(`${emoji}  ${msg}\n`);
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const PUBLISHED_AT = '2026-01-01T00:00:00.000Z';

const CATEGORIES = [
  { name: 'Birthday',          slug: 'birthday',    description: 'Crowd-pleasers for every age',   sortOrder: 1 },
  { name: 'Anniversary',       slug: 'anniversary', description: 'Elegant, intimate, romantic',     sortOrder: 2 },
  { name: 'Designer & Fondant',slug: 'designer',    description: 'Sculpted themes & tiers',         sortOrder: 3 },
  { name: 'Indian Fusion',     slug: 'fusion',      description: 'Mithai meets patisserie',         sortOrder: 4 },
  { name: 'Cheesecakes',       slug: 'cheesecake',  description: 'Baked, burnt & beautiful',        sortOrder: 5 },
  { name: 'Brownies & Boxes',  slug: 'treats',      description: 'Gifting & dessert boxes',         sortOrder: 6 },
];

const CAKES = [
  {
    slug: 'belgian-chocolate-truffle',
    name: 'Belgian Chocolate Truffle',
    shortDescription: 'Dark couverture ganache, layered six times',
    description: 'The cake half of Pune orders for birthdays — and the other half orders after tasting it at one. Moist chocolate sponge soaked in vanilla syrup, layered with silky Belgian couverture ganache and finished with a mirror glaze. Rich without being heavy.',
    basePrice: 1299,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: true,
    availableWeights: ['0.5 kg', '1 kg', '1.5 kg', '2 kg'],
    availableFlavors: ['Classic dark', '55% intense', 'Choco-orange'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy. Egg-free option available.',
    isActive: true,
    categorySlug: 'birthday',
    seoTitle: 'Belgian Chocolate Truffle Cake in Pune | VBake4U',
    seoDescription: 'Rich Belgian couverture ganache layered six times. Order handmade in Pune by Chef Vanita Sharma.',
  },
  {
    slug: 'alphonso-mango-cloud',
    name: 'Alphonso Mango Cloud',
    shortDescription: 'Ratnagiri Alphonso, fresh cream, in season only',
    description: 'Available April to June, while real Ratnagiri Alphonsos last. Feather-light vanilla chiffon layered with fresh Alphonso pulp and lightly sweetened cream — no essence, no canned pulp, ever. The most photographed cake in my kitchen.',
    basePrice: 1499,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: true,
    availableWeights: ['0.5 kg', '1 kg', '1.5 kg'],
    availableFlavors: ['Classic', 'Mango-coconut'],
    egglessAvailable: true,
    leadTimeHours: 36,
    allergenInfo: 'Contains gluten, dairy. Egg-free option available.',
    isActive: true,
    categorySlug: 'birthday',
    seoTitle: 'Alphonso Mango Cloud Cake in Pune | VBake4U',
    seoDescription: 'Fresh Ratnagiri Alphonso mango cake, available April–June only. Handmade by Chef Vanita Sharma.',
  },
  {
    slug: 'red-velvet-cream-cheese',
    name: 'Red Velvet & Cream Cheese',
    shortDescription: 'Velvet crumb, tangy cream-cheese frosting',
    description: 'A proper red velvet — buttermilk crumb with a whisper of cocoa, frosted with cream cheese that\'s tangy, not sugary. Finished with velvet crumbs and a single chocolate heart. The anniversary favourite.',
    basePrice: 1399,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: true,
    availableWeights: ['0.5 kg', '1 kg', '2 kg'],
    availableFlavors: ['Classic', 'White-chocolate drizzle'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy. Egg-free option available.',
    isActive: true,
    categorySlug: 'anniversary',
    seoTitle: 'Red Velvet Cream Cheese Cake in Pune | VBake4U',
    seoDescription: 'Classic red velvet with tangy cream cheese frosting. Handmade by Chef Vanita Sharma in Pune.',
  },
  {
    slug: 'rasmalai-fusion',
    name: 'Rasmalai Fusion Cake',
    shortDescription: 'Saffron sponge, rabdi cream, pistachio dust',
    description: 'Where mithai meets patisserie. Saffron-cardamom sponge soaked in rabdi, layered with malai cream and crowned with crushed pistachios and dried rose petals. The festival season bestseller — Diwali slots go weeks in advance.',
    basePrice: 1549,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: true,
    availableWeights: ['0.5 kg', '1 kg', '1.5 kg'],
    availableFlavors: ['Classic', 'Kesar-badam'],
    egglessAvailable: true,
    leadTimeHours: 36,
    allergenInfo: 'Contains gluten, dairy, nuts (pistachio, almond). Egg-free option available.',
    isActive: true,
    categorySlug: 'fusion',
    seoTitle: 'Rasmalai Fusion Cake in Pune | VBake4U',
    seoDescription: 'Saffron sponge with rabdi cream and pistachio dust. Indian fusion cake by Chef Vanita Sharma.',
  },
  {
    slug: 'lotus-biscoff-crunch',
    name: 'Lotus Biscoff Crunch',
    shortDescription: 'Caramelised biscuit layers, salted crunch',
    description: 'Brown-butter sponge with Biscoff spread in every layer, a salted caramelised-biscuit crunch through the middle, and a Biscoff drip that needs no introduction. Teen birthdays\' undisputed champion.',
    basePrice: 1599,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg', '2 kg'],
    availableFlavors: ['Classic', 'Choco-Biscoff'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy, soy. Egg-free option available.',
    isActive: true,
    categorySlug: 'birthday',
    seoTitle: 'Lotus Biscoff Crunch Cake in Pune | VBake4U',
    seoDescription: 'Caramelised Lotus Biscoff cake with salted crunch. Handmade birthday cake by Chef Vanita Sharma.',
  },
  {
    slug: 'dark-hazelnut-praline',
    name: 'Dark Hazelnut Praline',
    shortDescription: '70% dark, roasted hazelnut praline, gold leaf',
    description: 'The grown-up chocolate cake. 70% dark sponge, house-made roasted hazelnut praline, and a bitter-sweet ganache finished with edible gold leaf. Built for anniversaries and quiet luxury.',
    basePrice: 1699,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg', '1.5 kg'],
    availableFlavors: ['Classic', 'Espresso-praline'],
    egglessAvailable: false,
    leadTimeHours: 36,
    allergenInfo: 'Contains gluten, dairy, egg, nuts (hazelnut).',
    isActive: true,
    categorySlug: 'anniversary',
    seoTitle: 'Dark Hazelnut Praline Cake in Pune | VBake4U',
    seoDescription: '70% dark chocolate with roasted hazelnut praline and edible gold leaf. Premium anniversary cake in Pune.',
  },
  {
    slug: 'gulab-jamun-baked-cheesecake',
    name: 'Gulab Jamun Baked Cheesecake',
    shortDescription: 'Baked cheesecake studded with mini jamuns',
    description: 'A slow-baked New York cheesecake with whole mini gulab jamuns folded through, finished with saffron syrup and slivered pistachio. Sounds improbable. Disappears first at every party.',
    basePrice: 1649,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg'],
    availableFlavors: ['Classic'],
    egglessAvailable: false,
    leadTimeHours: 48,
    allergenInfo: 'Contains gluten, dairy, egg, nuts (pistachio).',
    isActive: true,
    categorySlug: 'fusion',
    seoTitle: 'Gulab Jamun Baked Cheesecake in Pune | VBake4U',
    seoDescription: 'New York cheesecake with whole gulab jamuns and saffron syrup. Indian fusion dessert in Pune.',
  },
  {
    slug: 'basque-burnt-cheesecake',
    name: 'Basque Burnt Cheesecake',
    shortDescription: 'Caramelised top, molten centre, no crust',
    description: 'Burnt on purpose. Deeply caramelised outside, custardy and just-set inside, no crust to get in the way. Serve at room temperature with nothing at all.',
    basePrice: 1449,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg'],
    availableFlavors: ['Classic', 'Biscoff swirl'],
    egglessAvailable: false,
    leadTimeHours: 48,
    allergenInfo: 'Contains dairy, egg.',
    isActive: true,
    categorySlug: 'cheesecake',
    seoTitle: 'Basque Burnt Cheesecake in Pune | VBake4U',
    seoDescription: 'Deeply caramelised Basque cheesecake with molten centre. Handmade by Chef Vanita Sharma in Pune.',
  },
  {
    slug: 'classic-pineapple-fresh-cream',
    name: 'Classic Pineapple Fresh Cream',
    shortDescription: 'The nostalgic one, done properly',
    description: 'The cake everyone grew up with — vanilla sponge, fresh (never canned-syrup-sweet) pineapple, and proper dairy cream whipped the same morning. Simple, light, and quietly perfect.',
    basePrice: 999,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg', '2 kg'],
    availableFlavors: ['Classic'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy. Egg-free option available.',
    isActive: true,
    categorySlug: 'birthday',
    seoTitle: 'Pineapple Fresh Cream Cake in Pune | VBake4U',
    seoDescription: 'Classic pineapple fresh cream cake baked the same morning. Affordable birthday cakes in Pune.',
  },
  {
    slug: 'butterscotch-caramel-crunch',
    name: 'Butterscotch Caramel Crunch',
    shortDescription: 'Praline crunch, salted caramel drip',
    description: 'Golden sponge with house-made butterscotch praline in every layer and a salted caramel drip. The office-party order that gets you promoted.',
    basePrice: 1099,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['0.5 kg', '1 kg', '2 kg'],
    availableFlavors: ['Classic', 'Coffee-caramel'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy, nuts (cashew). Egg-free option available.',
    isActive: true,
    categorySlug: 'birthday',
    seoTitle: 'Butterscotch Caramel Crunch Cake in Pune | VBake4U',
    seoDescription: 'Butterscotch praline with salted caramel drip. Crowd-pleasing birthday cake handmade in Pune.',
  },
  {
    slug: 'bespoke-fondant-celebration',
    name: 'Bespoke Fondant Celebration',
    shortDescription: 'Your theme, sculpted by hand',
    description: 'Unicorns, cricket pitches, vintage cars, jungle safaris — share the theme and a reference photo, and I\'ll sketch a design for your approval before baking. Every figure is hand-sculpted, food-safe fondant over your choice of sponge.',
    basePrice: 0,
    startingPriceLabel: '',
    isCustomPricing: true,
    isFeatured: true,
    availableWeights: ['1 kg', '1.5 kg', '2 kg', '3 kg+'],
    availableFlavors: ['Chocolate truffle', 'Vanilla berry', 'Butterscotch', 'Red velvet'],
    egglessAvailable: true,
    leadTimeHours: 96,
    allergenInfo: 'Varies by design — confirmed on your sketch approval.',
    isActive: true,
    categorySlug: 'designer',
    seoTitle: 'Custom Fondant Cake Pune | VBake4U',
    seoDescription: 'Hand-sculpted bespoke fondant cakes for any theme. Custom designs with sketch approval process.',
  },
  {
    slug: 'two-tier-wedding-classic',
    name: 'Two-Tier Wedding Classic',
    shortDescription: 'Buttercream florals, semi-naked or classic',
    description: 'An intimate wedding centrepiece — two tiers in semi-naked or smooth buttercream, dressed with fresh florals sourced the same morning. Includes a tasting box of three flavours before you decide.',
    basePrice: 0,
    startingPriceLabel: 'From ₹4,500',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['2.5 kg', '3.5 kg', '5 kg'],
    availableFlavors: ['Vanilla berry', 'Chocolate truffle', 'Lemon-elderflower', 'Red velvet'],
    egglessAvailable: true,
    leadTimeHours: 168,
    allergenInfo: 'Contains gluten, dairy. Egg-free option available.',
    isActive: true,
    categorySlug: 'designer',
    seoTitle: 'Wedding Cake Pune | VBake4U',
    seoDescription: 'Two-tier wedding cake with buttercream florals. Intimate wedding cakes in Pune by Chef Vanita Sharma.',
  },
  {
    slug: 'celebration-brownie-box',
    name: 'Celebration Brownie Box',
    shortDescription: '12 fudge brownies, 4 flavours, gift-wrapped',
    description: 'A dozen dense, fudgy brownies across four flavours — classic walnut, sea-salt caramel, Biscoff, and double chocolate — in a ribboned gift box with a handwritten note. The corporate and festival gifting staple.',
    basePrice: 849,
    startingPriceLabel: '',
    isCustomPricing: false,
    isFeatured: false,
    availableWeights: ['Box of 12', 'Box of 24'],
    availableFlavors: ['Assorted', 'All chocolate', 'No nuts'],
    egglessAvailable: true,
    leadTimeHours: 24,
    allergenInfo: 'Contains gluten, dairy, nuts (walnut). Egg-free & no-nut options available.',
    isActive: true,
    categorySlug: 'treats',
    seoTitle: 'Brownie Gift Box Pune | VBake4U',
    seoDescription: 'Dozen fudge brownies in 4 flavours, gift-wrapped. Corporate gifting and festival hampers in Pune.',
  },
];

const TESTIMONIALS = [
  {
    customerName: 'Priya Deshmukh',
    location: 'Baner, Pune',
    rating: 5,
    review: 'Ordered the truffle cake for my daughter\'s 7th birthday. Vanita asked about her favourite colour and added tiny handmade butterflies — my daughter still talks about \'the butterfly cake\'.',
    occasion: 'Birthday',
    isApproved: true,
    sortOrder: 1,
  },
  {
    customerName: 'Rohan & Sneha Kulkarni',
    location: 'Kothrud, Pune',
    rating: 5,
    review: 'The rasmalai cake at our anniversary dinner had my mother-in-law asking for the baker\'s number. That has never happened before.',
    occasion: 'Anniversary',
    isApproved: true,
    sortOrder: 2,
  },
  {
    customerName: 'Aditi Paranjape',
    location: 'Viman Nagar, Pune',
    rating: 5,
    review: 'I ordered the mango cloud after seeing it on Instagram. It tasted better than it looked, which I didn\'t think was possible. Real Alphonso, you can tell.',
    occasion: 'Birthday',
    isApproved: true,
    sortOrder: 3,
  },
  {
    customerName: 'Karan Mehta',
    location: 'Koregaon Park, Pune',
    rating: 4,
    review: 'Got brownie boxes for 40 clients this Diwali. Personal notes in each one, delivered on schedule. One client emailed just to ask where they were from.',
    occasion: 'Corporate',
    isApproved: true,
    sortOrder: 4,
  },
  {
    customerName: 'Shruti Iyer',
    location: 'Wakad, Pune',
    rating: 5,
    review: 'The fondant unicorn cake was beyond the reference photo I sent. Vanita sketched it first, checked every detail on WhatsApp, and delivered exactly that. Worth every rupee.',
    occasion: 'Birthday',
    isApproved: true,
    sortOrder: 5,
  },
];

const OCCASIONS = [
  {
    slug: 'birthday',
    name: 'Birthday',
    intro: 'A birthday cake should taste like the centre of attention. Every birthday cake here is baked the same morning, sized honestly (a 1 kg serves 10–12), and personalised — names piped by hand, candles included, photo-cake and theme options on request. Tell me the age, the vibe, and what they love; I\'ll suggest the right cake.',
    seoTitle: 'Birthday Cakes in Pune | VBake4U',
    seoDescription: 'Handmade birthday cakes by Chef Vanita Sharma. Baked fresh the morning of your celebration. From ₹999.',
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: 'anniversary',
    name: 'Anniversary',
    intro: 'Anniversary cakes here lean elegant — single-tier, refined finishes, flavours made for two people sharing slices over a week. Red velvet and dark praline are the perennial favourites; both come in 0.5 kg sizes perfect for intimate dinners. Add a handwritten card, fresh flowers, or a midnight delivery.',
    seoTitle: 'Anniversary Cakes in Pune | VBake4U',
    seoDescription: 'Elegant anniversary cakes handmade in Pune. Red velvet, dark praline, and more — from Chef Vanita Sharma.',
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: 'wedding',
    name: 'Wedding',
    intro: 'I take a maximum of two wedding cakes a month, so each gets the attention it deserves. Semi-naked, buttercream florals, or classic fondant — every wedding order starts with a tasting box of three flavours and a sketch for approval. Pune venues only, delivered and assembled by me personally.',
    seoTitle: 'Wedding Cakes in Pune | VBake4U',
    seoDescription: 'Two-tier wedding cakes with tasting box and sketch approval. Limited slots per month — book early.',
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: 'baby-shower',
    name: 'Baby Shower',
    intro: 'Pastel buttercream, hand-piped booties, and gender-reveal centres that actually keep the secret (I\'ll be the only one who knows). Godh bharai orders often pair a centrepiece cake with matching cupcake favours for guests — ask about the combo pricing.',
    seoTitle: 'Baby Shower Cakes in Pune | VBake4U',
    seoDescription: 'Pastel baby shower cakes with gender reveal option. Matching cupcake favours available. Handmade in Pune.',
    sortOrder: 4,
    isActive: true,
  },
  {
    slug: 'festival',
    name: 'Festival',
    intro: 'Festival season is fusion season — rasmalai cakes, gulab jamun cheesecakes, and mithai-inspired brownie boxes that make better gifts than another box of soan papdi. Diwali slots open six weeks early and corporate orders book most of them; reserve ahead.',
    seoTitle: 'Festival & Diwali Cakes in Pune | VBake4U',
    seoDescription: 'Indian fusion festival cakes for Diwali, Raksha Bandhan and Christmas. Rasmalai, Biscoff, brownie boxes.',
    sortOrder: 5,
    isActive: true,
  },
  {
    slug: 'corporate',
    name: 'Corporate',
    intro: 'Brownie boxes with handwritten name cards, milestone cakes for launches and work anniversaries, and festive gifting at scale (10–200 boxes). GST invoices provided, delivery staggered across offices in Kharadi, Viman Nagar, and Hinjewadi. One point of contact: my WhatsApp.',
    seoTitle: 'Corporate Cake Gifting Pune | VBake4U',
    seoDescription: 'Brownie boxes and milestone cakes for corporate gifting in Pune. GST invoices, bulk orders 10–200 boxes.',
    sortOrder: 6,
    isActive: true,
  },
  {
    slug: 'custom',
    name: 'Something Custom',
    intro: 'Proposals hidden inside cakes, replica handbags, a cake shaped like a client\'s first product — the strangest briefs become the best cakes. Start with the Cake Designer below or just voice-note me the idea on WhatsApp. I\'ll sketch it, price it, and tell you honestly if it won\'t work.',
    seoTitle: 'Custom Cakes Pune | VBake4U',
    seoDescription: 'Bespoke custom cakes for any occasion or theme. Sketch approval before baking. Fondant from ₹2,200/kg.',
    sortOrder: 7,
    isActive: true,
  },
];

const GLOBAL = {
  siteName: 'VBake4U',
  logoAlt: 'VBake4U — where every bite counts',
  announcementText: 'Now taking orders for the weekend — reserve by Thursday 6 pm',
  whatsappNumber: '918123008800',
  phoneNumber: '+91 81230 08800',
  email: 'hello@vbake4u.com',
  instagramUrl: 'https://instagram.com/vbake4u_',
  address: '1604, H Wing, Kingsbury Phase 3, Charholi, Pune 412105',
  fssaiNumber: '21526083004442',
  footerTagline: 'Small-batch celebration cakes, baked at home in Pune by Vanita Sharma.',
  footerText: 'Orders confirmed personally — no automated checkout',
  defaultSeoTitle: 'VBake4U — Premium Homemade Celebration Cakes in Pune',
  defaultSeoDescription: 'Handmade birthday, baby shower and anniversary cakes by Chef Vanita Sharma. Baked fresh the morning of your celebration. Reserve on WhatsApp.',
};

// ─── Seed runners ────────────────────────────────────────────────────────────

async function seedGlobal() {
  log('🌐', 'Seeding Global settings…');
  await updateSingle('global', GLOBAL);
  log('✅', 'Global settings updated');
}

async function seedCategories() {
  log('📂', 'Seeding Categories…');
  const idMap = {};
  for (const cat of CATEGORIES) {
    const existing = await findBySlug('categories', cat.slug);
    if (existing) {
      log('⏭ ', `Category "${cat.name}" already exists — skipping`);
      idMap[cat.slug] = existing.documentId;
      continue;
    }
    const created = await create('categories', cat);
    log('✅', `Created category: ${cat.name}`);
    idMap[cat.slug] = created.documentId;
  }
  return idMap;
}

async function seedCakes(categoryDocIdMap) {
  log('🎂', 'Seeding Cakes…');
  for (const cake of CAKES) {
    const existing = await findBySlug('cakes', cake.slug);
    if (existing) {
      log('⏭ ', `Cake "${cake.name}" already exists — skipping`);
      continue;
    }
    const { categorySlug, ...rest } = cake;
    const categoryDocId = categoryDocIdMap[categorySlug];
    const data = {
      ...rest,
      publishedAt: PUBLISHED_AT,
      ...(categoryDocId ? { category: { connect: [categoryDocId] } } : {}),
    };
    await create('cakes', data);
    log('✅', `Created cake: ${cake.name}`);
  }
}

async function seedTestimonials() {
  log('💬', 'Seeding Testimonials…');
  for (const t of TESTIMONIALS) {
    // Testimonials have no slug — check by customerName
    const res = await req('GET', `/api/testimonials?filters[customerName][$eq]=${encodeURIComponent(t.customerName)}&pagination[pageSize]=1`);
    if (res.data?.[0]) {
      log('⏭ ', `Testimonial from "${t.customerName}" already exists — skipping`);
      continue;
    }
    await create('testimonials', t);
    log('✅', `Created testimonial: ${t.customerName}`);
  }
}

async function seedOccasions() {
  log('🎉', 'Seeding Occasions…');
  for (const o of OCCASIONS) {
    const existing = await findBySlug('occasions', o.slug);
    if (existing) {
      log('⏭ ', `Occasion "${o.name}" already exists — skipping`);
      continue;
    }
    await create('occasions', o);
    log('✅', `Created occasion: ${o.name}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀  VBake4U Strapi Seed — ${STRAPI_URL}\n`);

  try {
    await seedGlobal();
    const catIds = await seedCategories();
    await seedCakes(catIds);
    await seedTestimonials();
    await seedOccasions();

    console.log('\n✅  Seed complete!\n');
    console.log('Next: upload product images via Strapi Admin → Media Library');
    console.log('      then assign images to Cakes and Categories.\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    process.exit(1);
  }
}

main();

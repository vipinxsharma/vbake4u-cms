# VBake4U CMS — Content Guide

A practical guide for Nitu Sharma on how to manage cakes, categories, and occasions in the admin panel.

**Admin URL:** `https://cms.vbake4u.com/admin`  
(Local dev: `http://localhost:1337/admin`)

---

## Logging in

Use the email and password you set when you first opened the admin panel.  
If you ever get locked out, ask your developer to reset your admin password.

---

## Adding or editing a cake

1. Click **Content Manager** in the left sidebar.
2. Click **Cake** under Collection Types.
3. Click **Create new entry** (top right) or click an existing cake to edit it.

### Required fields

| Field | What to enter |
|---|---|
| **Name** | The full cake name, e.g. `Mango Cream Cake` |
| **Slug** | Auto-filled from the name. Only change it if the URL needs to be different. Once orders reference a slug, do not change it. |
| **Eggless Available** | Tick ✓ if this cake can be made without eggs |
| **Is Active** | Tick ✓ to show the cake on the website. Untick to hide it without deleting. |

### Recommended fields

| Field | What to enter |
|---|---|
| **Category** | Pick the most relevant category (e.g. Birthday, Wedding). Affects filters on the catalog page. |
| **Short Description** | One sentence for the product card (aim for under 100 characters). Example: `A light mango sponge with fresh cream frosting — perfect for summer celebrations.` |
| **Description** | Longer description shown on the product page. Supports formatting (bold, lists). Aim for 2–4 sentences. |
| **Gallery** | Upload 3–6 photos. First photo appears as the main image. JPG/PNG, at least 800×800px for best quality. |
| **Base Price** | Price in ₹ (INR) for the default/smallest size. Enter numbers only, e.g. `1299`. |
| **Lead Time Hours** | How many hours of advance notice you need. Default is `24`. Enter `48` for complex cakes. |

---

## Available Weights

Use this field to show customers the size options for a cake.

**Format:** Enter a JSON array of strings. Each string is one size option.

```json
["0.5 kg", "1 kg", "1.5 kg", "2 kg"]
```

**Rules:**
- Use double quotes `"` around each option.
- Separate options with a comma.
- Wrap the whole thing in square brackets `[` `]`.
- Consistent naming helps — use either `kg` or `g` throughout, not a mix.

**Examples:**

Small cake with two sizes:
```json
["0.5 kg", "1 kg"]
```

Tiered wedding cake:
```json
["2 kg", "3 kg", "4 kg", "5 kg"]
```

Cake available in only one size — leave the field blank.

**What customers see:** The weights appear as selectable chips on the product page. They are reminded to confirm their choice with Nitu when they send their WhatsApp reservation.

---

## Available Flavours

Use this field to show customers the flavour options.

**Format:** JSON array of strings — exactly the same format as Available Weights.

```json
["Chocolate", "Vanilla", "Strawberry", "Red Velvet"]
```

**Examples:**

Standard options:
```json
["Chocolate", "Vanilla", "Butterscotch"]
```

Specialty flavours:
```json
["Dark Chocolate Truffle", "Mango Cream", "Lemon Blueberry", "Rose Pistachio"]
```

Cake available in one flavour only — leave the field blank.

**Tips:**
- Capitalise each flavour name.
- If a flavour combination is common, list it as one option: `"Chocolate & Orange"`.
- Keep the list under 8 options to avoid cluttering the product page.

---

## Allergen Info

Use this field to add a cake-specific allergen note that appears on the product page.

This is **in addition to** the site-wide allergen policy page — use it for cake-specific details only.

**Leave blank if:** The cake's allergens are fully covered by the site-wide allergen policy (contains wheat, eggs, dairy, and may contain nuts/soy). The site-wide note will show instead.

**Fill it in when:** The cake has something unusual — for example, it contains nuts directly, or it is free of a common allergen that customers may ask about.

**What to write:** One or two plain sentences. No need for formatting.

Examples:

> Contains: wheat, eggs, dairy, cashews. May contain traces of other tree nuts and soy.

> Eggless version available. Contains: wheat, dairy. May contain traces of nuts, sesame and soy.

> Nut-free recipe. Contains: wheat, eggs, dairy. Made in a kitchen that also handles nuts — please let Nitu know if you need extra care.

---

## Pricing options

| Situation | What to do |
|---|---|
| Standard cake with a fixed base price | Enter the price in **Base Price** |
| Cake where price varies significantly by size | Leave Base Price blank. Enter a label like `From ₹1,299` in **Starting Price Label**. |
| Fully custom cake (quote on request) | Tick **Is Custom Pricing**. Leave Base Price and Starting Price Label blank. The website shows "Price on request" and directs customers to WhatsApp. |

---

## Eggless availability

- Tick **Eggless Available** if you can make this cake without eggs.
- This enables the Eggless filter on the catalog page so customers can find it easily.
- If the eggless version has a different price, mention it in the Short Description or Description.

---

## Featured cakes

- Tick **Is Featured** to include a cake in the "Signature Cakes" section on the home page.
- Aim for 3–6 featured cakes at a time — your best-looking, most popular, or most seasonal options.

---

## Publishing a cake

1. Fill in all the required fields and as many recommended fields as you can.
2. Upload at least one good photo.
3. Click **Save** (top right) to save your draft.
4. Click **Publish** to make the cake live on the website.

The website updates within a few minutes of publishing. If you need it to update immediately, use the cache flush button (see below).

### Taking a cake offline temporarily

Untick **Is Active** and save. The cake will no longer appear on the website, but you keep all your content.  
Alternatively, click **Unpublish** to revert it to draft status.

---

## Cache flush (force immediate update)

After publishing or changing content, the website caches pages for up to 1 hour.  
To force an immediate update, your developer can call:

```
POST https://vbake4u.com/api/revalidate
Authorization: Bearer <REVALIDATE_SECRET>
Body: { "tag": "cakes" }
```

Ask your developer to set up a Strapi webhook (Settings → Webhooks) so this happens automatically whenever you publish a change.

---

## Managing Categories

1. Go to **Content Manager → Category**.
2. Categories appear as filter chips on the `/cakes` catalog page.
3. Each category has:
   - **Name** — displayed to customers (e.g. `Birthday`)
   - **Slug** — auto-generated, used in URLs (e.g. `birthday`)
   - **Description** — optional, used on the category page if one is created later
   - **Sort Order** — lower numbers appear first in the filter strip
4. Assign categories to cakes using the **Category** field on each cake.

---

## Managing Occasions

Occasions are SEO landing pages (e.g. `/occasions/birthday`).  
The 7 default occasions (Birthday, Anniversary, Wedding, Baby Shower, Festival, Corporate, Custom) are built into the website and work without any CMS entries.

To customise an occasion page:

1. Go to **Content Manager → Occasion**.
2. Create an entry with the same slug as the default (e.g. `birthday`).
3. Fill in:
   - **Hero Photo** — a wide landscape photo for the banner (1600×600px ideal)
   - **Intro** — 80–120 word paragraph for SEO
   - **Featured Cakes** — pick 3–6 cakes to highlight on the page
   - **SEO Title / SEO Description** — for Google snippets

The CMS version takes precedence over the built-in fallback when both exist.

---

## Tips for good photos

- Shoot in natural light, near a window.
- Use a plain background (white board, marble slab, or plain fabric).
- Take photos from directly above and at 45°.
- Resize to at least 1000×1000px before uploading.
- File size under 3 MB each.
- First photo in the gallery becomes the main product image.

---

## Common mistakes to avoid

| Mistake | What to do instead |
|---|---|
| Entering weights as plain text (`500g, 1kg`) | Use JSON format: `["500g", "1 kg"]` |
| Forgetting to publish after saving | Click **Publish** — draft entries do not appear on the website |
| Uploading very large photos | Resize to under 3 MB before uploading |
| Changing a slug after the cake is live | Don't — it breaks existing links. If you must, ask your developer. |
| Entering a price with ₹ symbol in Base Price | Enter numbers only, e.g. `1299` not `₹1,299` |

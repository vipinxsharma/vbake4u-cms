# VBake4U CMS

Strapi 5 backend for the VBake4U premium home bakery platform.

**Owner:** Nitu Sharma  
**Domain:** vbake4u.com  
**Stack:** Strapi 5.46 · PostgreSQL · Cloudflare R2 · Resend · Railway

---

## Local development

```bash
cp .env.example .env
# Edit .env — set at minimum:
#   APP_KEYS, ADMIN_JWT_SECRET, API_TOKEN_SALT, JWT_SECRET,
#   TRANSFER_TOKEN_SALT, ENCRYPTION_KEY, DATABASE_* values
npm install
npm run dev
# Admin panel → http://localhost:1337/admin
```

## Production (Railway)

Environment variables are managed in the Railway dashboard.  
See `.env.example` for the full variable inventory.

| Phase | Command |
|---|---|
| Build | `NODE_ENV=production npm run build` |
| Start | `NODE_ENV=production npm run start` |
| Health | `GET /_health` |

## Infrastructure patterns (from 2M2L — battle-tested)

| Pattern | Status | PR |
|---|---|---|
| R2 media (fail-closed) | Pending | 1.2 |
| Resend order notifications | Pending | 1.2 |
| CORS env-var allowlist | ✅ Shipped | 1.1 |
| Bootstrap public permissions | Pending | 2.x |
| Rate limiting | Pending | 1.2 |
| Native test runner | Pending | 1.2 |

## Content editing

See **[docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)** for step-by-step instructions on:

- Adding and publishing cakes (weights, flavours, allergen info, pricing, photos)
- Managing categories and occasion pages
- JSON field format for `availableWeights` and `availableFlavors`
- Common mistakes to avoid

## Phase 2 CMS models

Global · Category · Cake · AddOn · DeliveryZone · DailyCapacity ·  
Order · Testimonial · AISettings · Occasion · Combo

All arrive as small individual PRs — see project board.

## Security rules

- All secrets in Railway env vars; never committed
- `STRAPI_PRODUCTION_FORCE_R2=true` enforced in production
- Order customer PII (phone/email/address) never returned on public endpoints
- Razorpay in test mode until explicit go-live approval

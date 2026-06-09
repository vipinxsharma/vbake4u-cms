# VBake4U CMS Infrastructure Guide

This document describes the infrastructure patterns running in this Strapi 5 project,
all ported from the battle-tested 2M2L CMS.

---

## Cloudflare R2 (media storage)

Cake gallery photos are stored in Cloudflare R2 via the `@strapi/provider-upload-aws-s3` adapter.

### Required env vars

| Variable | Description |
|---|---|
| `R2_ACCESS_KEY_ID` | R2 API token Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API token Secret |
| `R2_BUCKET` | Bucket name (`vbake4u-media`) |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | Custom domain e.g. `https://media.vbake4u.com` |
| `STRAPI_PRODUCTION_FORCE_R2` | Set `true` on Railway to refuse boot if R2 is misconfigured |

### Fail-closed lock

With `STRAPI_PRODUCTION_FORCE_R2=true`, the CMS refuses to boot if any R2 variable is missing.
This prevents the ephemeral local-disk fallback, which silently wipes all uploads on Railway redeploy.

### Boot probe

On every startup, `logR2Status()` logs one line:
```
[R2] enabled — uploads via aws-s3 provider, public URL set
[R2] disabled — falling back to local uploads (EPHEMERAL on Railway). Missing: R2_BUCKET, ...
```

---

## Resend (transactional email)

Used to notify Nitu of new orders, custom quote requests, and (Sprint 2) AI design requests.

### Required env vars

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sending address (must be verified in Resend, e.g. `orders@vbake4u.com`) |
| `EMAIL_TO` | Nitu’s inbox — receives every notification |

### Boot probe

On every startup, `logResendStatus()` logs one line:
```
[resend] enabled sdk=6.x.x key=re_123… (len=40) from=orders@vbake4u.com to_count=1
[resend] disabled: RESEND_API_KEY missing, EMAIL_TO missing
```

---

## Rate limiting

In-process IP+path keyed rate limiter (`src/middlewares/rate-limit.js`).
No Redis dependency — appropriate for a single Railway service.

### Current rules

| Path | Max requests | Window |
|---|---|---|
| `/api/orders` | 5 | 60s |
| `/api/ai-design-requests` | 2 | 60s |

Add more rules in `config/middlewares.js` under `global::rate-limit.config.rules`.

### Rate-limit response headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <unix-seconds>
Retry-After: <seconds>  (on 429 only)
```

---

## Health endpoint

`GET /_health` → `{ status: 'ok' }` (200)

Registered as a Koa middleware in `src/index.js`. No `/api` prefix.
Used by Railway’s `healthcheckPath` in `railway.toml`.

---

## CORS

`vbake4u.com` and `localhost:3000/3001` are always allowed.

Add Vercel preview deploy origins without a CMS redeploy:
```
CORS_EXTRA_ORIGINS=https://vbake4u-web-git-preview-xyz.vercel.app,https://vbake4u-web-abc.vercel.app
```

---

## Public permissions bootstrap

`setPublicPermissions()` in `src/index.js` declaratively grants public-role actions
to Strapi endpoints. The map is populated incrementally as Phase 2 PRs add content types.

Current grants: none (Phase 2 PRs add them).

This approach is preferred over manual admin-panel clicks because:
- It’s version-controlled and auditable
- It’s idempotent (safe to run on every boot)
- New Railway services start with correct permissions automatically

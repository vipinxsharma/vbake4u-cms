# VBake4U CMS — Claude Code Reference

## Database (Neon PostgreSQL)

**Neon project for vbake4u-cms ONLY:**
```
Host: ep-bitter-sun-aqx829fw.c-8.us-east-1.aws.neon.tech
DB:   neondb
```

Always use the **unpooled** connection string (no `-pooler` in host).
Strapi manages its own pool via knex — never route Strapi through PgBouncer.

### DO NOT confuse with these other Neon projects:

| Endpoint | Owner | Use for vbake4u? |
|---|---|---|
| `ep-bitter-sun-aqx829fw` | **vbake4u-cms** ✓ | YES — this one only |
| `ep-muddy-smoke-apsdntg6` | 2Meals2Lives-cms | NO |
| `ep-polished-snow-amym1n7m` | Agentic-thynkbots / KB avatars | NO |

### Railway environment variables (vbake4u-cms service)
Set these in Railway → vbake4u-cms service → Variables.
Retrieve the actual DATABASE_URL from Neon console → `ep-bitter-sun-aqx829fw` → Connection string (unpooled).

```
DATABASE_URL        (unpooled Neon connection string — from Neon console)
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

---

## Project identity

- **App**: VBake4U — Chef Vanita Sharma's home bakery, Pune
- **CMS**: Strapi 5, deployed on Railway
- **Frontend**: Next.js 15 on Vercel (`vipinxsharma-vbake4u-web`, `vipinxsharmas-projects` account only)
- **Media**: Cloudflare R2 (`vbake4u-media` bucket)
- **Vercel account**: `vipinxsharmas-projects` only — ignore `dsathynkwise-3100s-projects` completely

## No payments, no cart

All CTAs go to WhatsApp or `/cakes`. No Razorpay, no checkout, no cart — ever.

## Branch
Development branch: `claude/stoic-bohr-oqohuz`

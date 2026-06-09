'use strict';

/**
 * In-process rate limiter for public POST endpoints.
 * Keys requests by client IP + path. Each path has its own (max, windowMs).
 * Memory-only: per-instance, fine for a single Railway service.
 * Ported from 2M2L CMS where it guards /api/subscribers + /api/community-posts.
 */

const buckets = new Map();

function getKey(ctx) {
  const ip =
    ctx.ip ||
    (ctx.request.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    ctx.request.headers['x-real-ip'] ||
    ctx.request.ip ||
    'unknown';
  return `${ip}::${ctx.method} ${ctx.path}`;
}

function prune(now) {
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

module.exports = (config) => {
  const rules = (config && config.rules) || [];

  return async (ctx, next) => {
    if (ctx.method !== 'POST') return next();

    const rule = rules.find((r) => ctx.path === r.path);
    if (!rule) return next();

    const now = Date.now();
    prune(now);
    const key = getKey(ctx);
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + rule.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    ctx.set('X-RateLimit-Limit', String(rule.max));
    ctx.set('X-RateLimit-Remaining', String(Math.max(0, rule.max - bucket.count)));
    ctx.set('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > rule.max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      ctx.set('Retry-After', String(retryAfter));
      ctx.status = 429;
      ctx.body = {
        data: null,
        error: {
          status: 429,
          name: 'TooManyRequests',
          message: rule.message || 'Too many requests, please slow down.',
        },
      };
      strapi.log.info(
        `[rate-limit] ${ctx.method} ${ctx.path} blocked key=${key} ` +
        `(${bucket.count}/${rule.max} in ${rule.windowMs}ms)`
      );
      return;
    }

    return next();
  };
};

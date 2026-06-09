'use strict';

function logResendStatus(strapi) {
  const reasons = [];
  const apiKey   = process.env.RESEND_API_KEY;
  const fromAddr = process.env.RESEND_FROM_EMAIL;
  const toRaw    = process.env.EMAIL_TO;
  if (!apiKey)   reasons.push('RESEND_API_KEY missing');
  if (!fromAddr) reasons.push('RESEND_FROM_EMAIL missing');
  if (!toRaw)    reasons.push('EMAIL_TO missing');

  let sdkVersion = 'unknown';
  try {
    require.resolve('resend');
    try {
      const fs   = require('fs');
      const path = require('path');
      const entry = require.resolve('resend');
      const pkgPath = path.join(
        entry.split('/node_modules/')[0],
        'node_modules', 'resend', 'package.json'
      );
      sdkVersion = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || 'unknown';
    } catch (_) { /* non-fatal */ }
  } catch (_) {
    reasons.push('resend npm package missing');
  }

  const keyDisplay = apiKey ? `${apiKey.slice(0, 6)}… (len=${apiKey.length})` : '<unset>';
  const toCount = toRaw ? toRaw.split(',').map((s) => s.trim()).filter(Boolean).length : 0;

  if (reasons.length === 0) {
    strapi.log.info(
      `[resend] enabled sdk=${sdkVersion} key=${keyDisplay} from=${fromAddr} to_count=${toCount}`
    );
  } else {
    strapi.log.warn(`[resend] disabled: ${reasons.join(', ')}`);
  }
}

function logR2Status(strapi) {
  const required = {
    R2_ACCESS_KEY_ID:     process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET:            process.env.R2_BUCKET,
    R2_ENDPOINT:          process.env.R2_ENDPOINT,
  };
  const publicUrl = process.env.R2_PUBLIC_URL;
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);

  try { require.resolve('@strapi/provider-upload-aws-s3'); }
  catch (_) { missing.push('@strapi/provider-upload-aws-s3 package missing'); }

  if (missing.length === 0) {
    if (publicUrl) {
      strapi.log.info('[R2] enabled — uploads via aws-s3 provider, public URL set');
    } else {
      strapi.log.warn('[R2] enabled but R2_PUBLIC_URL missing — media URLs may not resolve in browser');
    }
  } else {
    strapi.log.warn(
      `[R2] disabled — falling back to local uploads (EPHEMERAL on Railway). Missing: ${missing.join(', ')}`
    );
  }
}

const PUBLIC_PERMISSIONS = {
  'api::global.global':               ['find'],            // PR 2.1
  'api::category.category':           ['find', 'findOne'], // PR 2.2
  'api::cake.cake':                   ['find', 'findOne'], // PR 2.2
  'api::add-on.add-on':               ['find', 'findOne'], // PR 2.2
  // 'api::delivery-zone.delivery-zone': ['find', 'findOne'], // PR 2.3
  // 'api::daily-capacity.daily-capacity': ['find'],          // PR 2.3
  // 'api::order.order':                 ['create'],          // PR 2.4 (create-only)
  // 'api::testimonial.testimonial':     ['find', 'findOne'], // PR 2.5
  // 'api::ai-setting.ai-setting':       ['find'],            // PR 2.6
  // 'api::occasion.occasion':           ['find', 'findOne'], // PR 2.7
  // 'api::combo.combo':                 ['find', 'findOne'], // PR 2.8
};

async function setPublicPermissions(strapi) {
  if (Object.keys(PUBLIC_PERMISSIONS).length === 0) return;

  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] public role not found; skipping permission setup');
    return;
  }

  for (const [controller, actions] of Object.entries(PUBLIC_PERMISSIONS)) {
    for (const action of actions) {
      const actionId = `${controller}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionId, role: publicRole.id } });
      if (existing) continue;
      try {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action: actionId, role: publicRole.id },
        });
        strapi.log.info(`[bootstrap] granted public ${actionId}`);
      } catch (err) {
        strapi.log.warn(`[bootstrap] could not grant ${actionId}: ${err.message}`);
      }
    }
  }
}

module.exports = {
  register({ strapi }) {
    strapi.server.app.use(async (ctx, next) => {
      if (ctx.path === '/_health') {
        ctx.status = 200;
        ctx.body = { status: 'ok' };
        return;
      }
      await next();
    });
  },

  async bootstrap({ strapi }) {
    try {
      await setPublicPermissions(strapi);
    } catch (err) {
      strapi.log.error(`[bootstrap] permission setup failed: ${err.message}`);
    }
    try {
      logResendStatus(strapi);
    } catch (err) {
      strapi.log.warn(`[bootstrap] resend status probe failed: ${err.message}`);
    }
    try {
      logR2Status(strapi);
    } catch (err) {
      strapi.log.warn(`[bootstrap] r2 status probe failed: ${err.message}`);
    }
  },
};

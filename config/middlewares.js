'use strict';

module.exports = ({ env }) => {
  // Allow extra origins (Vercel preview hashes) without a CMS redeploy.
  const defaultOrigins = [
    'https://vbake4u.com',
    'https://www.vbake4u.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  const extraOrigins = (env('CORS_EXTRA_ORIGINS', '') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const r2PublicUrl = env('R2_PUBLIC_URL');

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              'market-assets.strapi.io',
              ...(r2PublicUrl ? [r2PublicUrl.replace(/^https?:\/\//, '')] : []),
            ],
            'media-src': [
              "'self'",
              'data:',
              'blob:',
              ...(r2PublicUrl ? [r2PublicUrl.replace(/^https?:\/\//, '')] : []),
            ],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: [...defaultOrigins, ...extraOrigins],
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        keepHeadersOnError: true,
      },
    },
    'strapi::query',
    {
      name: 'strapi::body',
      config: {
        formLimit: '1mb',
        jsonLimit: '1mb',
        textLimit: '1mb',
        formidable: {
          maxFileSize: 10 * 1024 * 1024, // 10 MB — cake gallery photos
        },
      },
    },
    {
      name: 'global::rate-limit',
      config: {
        rules: [
          {
            // Order reservation: conservative for a single-baker operation
            path: '/api/orders',
            max: 5,
            windowMs: 60 * 1000,
            message: 'Too many order attempts. Please wait a minute and try again.',
          },
          {
            // AI design requests: cap to control OpenAI spend
            path: '/api/ai-design-requests',
            max: 2,
            windowMs: 60 * 1000,
            message: 'Too many AI design requests. Please wait a minute.',
          },
        ],
      },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

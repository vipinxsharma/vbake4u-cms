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

  // Permit R2 public URL in admin panel img-src when configured.
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
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

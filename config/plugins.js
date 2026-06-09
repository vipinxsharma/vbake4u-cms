'use strict';

module.exports = ({ env }) => {
  const r2AccessKey = env('R2_ACCESS_KEY_ID');
  const r2SecretKey = env('R2_SECRET_ACCESS_KEY');
  const r2Bucket    = env('R2_BUCKET');
  const r2Endpoint  = env('R2_ENDPOINT');
  // Public CDN URL returned on uploaded media. Without it, Strapi returns
  // /uploads/* paths that resolve against the CMS host, not the CDN.
  const r2PublicUrl = env('R2_PUBLIC_URL');

  const r2Enabled = r2AccessKey && r2SecretKey && r2Bucket && r2Endpoint;

  // Fail-closed: refuse to boot in production if R2 env is incomplete.
  // Prevents silently falling back to ephemeral local-disk on Railway
  // (which wipes every upload on the next redeploy).
  if (env('STRAPI_PRODUCTION_FORCE_R2') === 'true' && !r2Enabled) {
    const missing = [
      !r2AccessKey && 'R2_ACCESS_KEY_ID',
      !r2SecretKey && 'R2_SECRET_ACCESS_KEY',
      !r2Bucket    && 'R2_BUCKET',
      !r2Endpoint  && 'R2_ENDPOINT',
    ].filter(Boolean).join(', ');
    throw new Error(
      `[plugins] STRAPI_PRODUCTION_FORCE_R2=true but R2 envs are incomplete ` +
      `(missing: ${missing}). Refusing to start.`
    );
  }

  return {
    ...(r2Enabled && {
      upload: {
        config: {
          provider: 'aws-s3',
          providerOptions: {
            s3Options: {
              credentials: {
                accessKeyId: r2AccessKey,
                secretAccessKey: r2SecretKey,
              },
              endpoint: r2Endpoint,
              region: 'auto',
              params: {
                ACL: null, // R2 rejects standard S3 ACLs
                Bucket: r2Bucket,
              },
            },
            ...(r2PublicUrl ? { baseUrl: r2PublicUrl } : {}),
          },
          actionOptions: {
            upload: {},
            uploadStream: {},
            delete: {},
          },
        },
      },
    }),
  };
};

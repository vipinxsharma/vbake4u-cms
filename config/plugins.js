module.exports = ({ env }) => {
  // R2 fail-closed upload config is added in PR 1.2 (chore(infra): port R2 + Resend patterns).
  // Until then, local disk storage is used in development.
  return {};
};

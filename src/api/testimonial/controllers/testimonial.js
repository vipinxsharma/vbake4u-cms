'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Override find/findOne to enforce is_approved=true for public requests.
 * This prevents unapproved testimonials from leaking via query-param manipulation
 * (e.g. ?filters[isApproved][$eq]=false) even though the permission is find/findOne.
 */
module.exports = createCoreController('api::testimonial.testimonial', ({ strapi }) => ({
  async find(ctx) {
    // Force isApproved filter for all public reads
    ctx.query = ctx.query || {};
    ctx.query.filters = {
      ...ctx.query.filters,
      isApproved: { $eq: true },
    };
    return super.find(ctx);
  },

  async findOne(ctx) {
    // Re-use find to apply the same filter, then extract the first result
    const { id } = ctx.params;
    const entity = await strapi.entityService.findOne(
      'api::testimonial.testimonial',
      id,
      { populate: ctx.query.populate }
    );
    if (!entity || !entity.isApproved) {
      return ctx.notFound();
    }
    const sanitized = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitized);
  },
}));

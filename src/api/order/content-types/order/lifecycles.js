'use strict';

const { notifyNewOrder } = require('../../lib/notify');

/**
 * Generate a sequential order number: VB-YYYYMMDD-XXXX
 * Not guaranteed globally unique under concurrent requests, but collisions
 * are handled by the unique constraint on orderNumber — the DB rejects
 * duplicates and the UI retries. Sufficient for a single-baker operation.
 */
function generateOrderNumber() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9000) + 1000); // 4-digit random
  return `VB-${datePart}-${seq}`;
}

module.exports = {
  async beforeCreate(event) {
    if (!event.params.data.orderNumber) {
      event.params.data.orderNumber = generateOrderNumber();
    }
  },

  async afterCreate(event) {
    const { result } = event;
    // Notify Nitu of the new order via Resend (fire-and-forget; never blocks the response)
    notifyNewOrder(result).catch((err) =>
      strapi.log.warn(`[order] afterCreate notify failed: ${err.message}`)
    );
  },

  async afterUpdate(event) {
    const { result, params } = event;
    const newStatus = params.data?.status;
    if (newStatus !== 'reserved') return;

    // Increment bookedOrders on the DailyCapacity row for this delivery date
    if (!result.deliveryDate) return;
    try {
      const capacity = await strapi.db
        .query('api::daily-capacity.daily-capacity')
        .findOne({ where: { date: result.deliveryDate } });
      if (capacity) {
        await strapi.db.query('api::daily-capacity.daily-capacity').update({
          where: { id: capacity.id },
          data: { bookedOrders: (capacity.bookedOrders || 0) + 1 },
        });
      }
    } catch (err) {
      strapi.log.warn(`[order] afterUpdate capacity increment failed: ${err.message}`);
    }
  },
};

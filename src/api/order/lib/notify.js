'use strict';

/**
 * Resend notification to Nitu for new VBake4U orders.
 * Mirrors the 2M2L notify pattern: fail-open (never throws to caller),
 * lazy Resend client construction (avoids build-time crash on missing key).
 */

function formatOrderEmail(order) {
  const lines = [
    `<h2>New Order — ${order.orderNumber}</h2>`,
    `<table style="border-collapse:collapse;font-family:sans-serif">`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Customer</td><td><strong>${order.customerName}</strong></td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${order.customerPhone}</td></tr>`,
    order.customerEmail ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${order.customerEmail}</td></tr>` : '',
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Cake</td><td>${order.cakeName || '(not set)'}</td></tr>`,
    order.weight ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Weight</td><td>${order.weight}</td></tr>` : '',
    order.flavor ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Flavor</td><td>${order.flavor}</td></tr>` : '',
    order.eggless ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Eggless</td><td>Yes</td></tr>` : '',
    order.messageOnCake ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Message on cake</td><td>${order.messageOnCake}</td></tr>` : '',
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Delivery date</td><td><strong>${order.deliveryDate}</strong></td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Pincode</td><td>${order.deliveryPincode}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Address</td><td>${order.deliveryAddress}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Total</td><td>₹${order.totalAmount ?? '?'}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Deposit paid</td><td>₹${order.depositAmount ?? '?'}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Balance due</td><td>₹${order.balanceAmount ?? '?'}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Status</td><td>${order.status}</td></tr>`,
    order.notes ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Notes</td><td>${order.notes}</td></tr>` : '',
    `</table>`,
    `<p style="margin-top:16px;color:#666;font-size:12px">VBake4U CMS &bull; Confirm or contact customer via WhatsApp.</p>`,
  ];
  return lines.filter(Boolean).join('\n');
}

async function notifyNewOrder(order) {
  const apiKey   = process.env.RESEND_API_KEY;
  const fromAddr = process.env.RESEND_FROM_EMAIL;
  const toRaw    = process.env.EMAIL_TO;

  if (!apiKey || !fromAddr || !toRaw) {
    strapi.log.warn(
      `[order/notify] Resend not configured — skipping notification for ${order.orderNumber}`
    );
    return;
  }

  const { Resend } = require('resend');
  const resend = new Resend(apiKey);

  const to = toRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const subject = `New Order ${order.orderNumber} — ${order.customerName} — ${order.deliveryDate}`;

  const { error } = await resend.emails.send({
    from: fromAddr,
    to,
    subject,
    html: formatOrderEmail(order),
  });

  if (error) {
    strapi.log.warn(`[order/notify] Resend error for ${order.orderNumber}: ${JSON.stringify(error)}`);
  } else {
    strapi.log.info(`[order/notify] notification sent for ${order.orderNumber} to ${to.join(', ')}`);
  }
}

module.exports = { notifyNewOrder };

import { PROMO_CODES, TICKET_TIERS, WORKSHOP_PRICE } from "./event-data.js";

/**
 * Escapes HTML special characters to prevent XSS in dynamic templates.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

/**
 * Calculates line items, promo discount and final ruble total for checkout and 54-FZ receipt.
 * @param {object} checkoutState
 * @returns {{ tier: object, ticketsSum: number, workshopSum: number, subtotal: number, promo: object|null, discount: number, total: number }}
 */
export function calculateOrderTotals(checkoutState) {
  const tier = TICKET_TIERS.find((t) => t.id === checkoutState.tierId) || TICKET_TIERS[1];
  const ticketsSum = tier.price * checkoutState.qty;
  const workshopSum = checkoutState.addonWorkshop ? WORKSHOP_PRICE * checkoutState.qty : 0;
  const subtotal = ticketsSum + workshopSum;

  const promo = checkoutState.promoCode ? PROMO_CODES[checkoutState.promoCode] : null;
  const discount = promo ? Math.round(subtotal * (promo.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discount);

  return { tier, ticketsSum, workshopSum, subtotal, promo, discount, total };
}

export function buildFiscalItems(checkoutState, calc) {
  const ratio = calc.subtotal > 0 ? calc.total / calc.subtotal : 1;
  const unitTicketFinal = Math.round(calc.tier.price * ratio);
  const unitWorkshopFinal = Math.round(WORKSHOP_PRICE * ratio);

  const items = [
    {
      description: `Билет на конференцию MOTION 2026 (${calc.tier.name})`,
      quantity: checkoutState.qty,
      amount: { value: `${unitTicketFinal}.00`, currency: "RUB" },
      vat_code: 1,
      payment_subject: "service",
      payment_mode: "full_payment"
    }
  ];

  if (checkoutState.addonWorkshop) {
    items.push({
      description: "Участие в практическом AI-воркшопе (19.12.2026)",
      quantity: checkoutState.qty,
      amount: { value: `${unitWorkshopFinal}.00`, currency: "RUB" },
      vat_code: 1,
      payment_subject: "service",
      payment_mode: "full_payment"
    });
  }

  return items;
}

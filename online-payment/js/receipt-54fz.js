import { buildFiscalItems, calculateOrderTotals, escapeHtml } from "./pricing-engine.js";

/**
 * Renders 54-FZ fiscal receipt, electronic conference pass, and YuKassa webhook JSON.
 * Never persists or exposes full card numbers or CVC.
 * @param {object} checkoutState
 * @param {string} buyerName
 * @param {string} buyerEmail
 * @param {number} receiptSeq
 * @returns {string} Formatted webhook JSON
 */
export function renderSuccessReceiptAndTicket(checkoutState, buyerName, buyerEmail, receiptSeq) {
  const calc = calculateOrderTotals(checkoutState);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const fpd = String(Math.floor(1000000000 + Math.random() * 8999999999));
  const passCode = `MTN-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentUuid = `2e8a4f1b-000f-5000-a000-${Date.now().toString(16).slice(-12)}`;
  const methodText = checkoutState.payMethod === "sbp" ? "СБП (QR)" : "ЮKassa · Карта";

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("rec-method", methodText);
  setEl("rec-datetime", formattedDate);
  setEl("rec-email", buyerEmail);
  setEl("rec-total", `${calc.total.toLocaleString("ru-RU")}.00 ₽`);
  setEl("rec-fd", String(receiptSeq));
  setEl("rec-fpd", fpd);
  setEl("ticket-pass-code", `#${passCode}`);
  setEl("ticket-holder-name", buyerName);
  setEl("ticket-tier-label", `${calc.tier.name} · ${checkoutState.qty} шт.${checkoutState.addonWorkshop ? " + AI-воркшоп" : ""}`);

  const fiscalItems = buildFiscalItems(checkoutState, calc);
  const recItemsEl = document.getElementById("rec-items-list");
  if (recItemsEl) {
    recItemsEl.innerHTML = fiscalItems
      .map((item, idx) => {
        const lineTotal = Number(item.amount.value) * item.quantity;
        return `<div class="flex flex-col gap-0.5">
          <div class="font-semibold text-obsidian-900">${idx + 1}. ${escapeHtml(item.description)}</div>
          <div class="flex justify-between text-obsidian-600 pl-3">
            <span>${item.quantity} × ${Number(item.amount.value).toLocaleString("ru-RU")}.00 ₽ · УСЛУГА</span>
            <span class="font-semibold text-obsidian-900">${lineTotal.toLocaleString("ru-RU")}.00 ₽</span>
          </div>
        </div>`;
      })
      .join("");
  }

  const webhookPayload = {
    type: "notification",
    event: "payment.succeeded",
    object: {
      id: paymentUuid,
      status: "succeeded",
      paid: true,
      amount: { value: `${calc.total}.00`, currency: "RUB" },
      payment_method: {
        type: checkoutState.payMethod === "sbp" ? "sbp" : "bank_card",
        title: checkoutState.payMethod === "sbp" ? "Система быстрых платежей (СБП)" : "MIR *0042"
      },
      receipt_registration: "succeeded",
      fiscal_data_54fz: {
        ofd: "Платформа ОФД",
        fn_number: "7281440700918412",
        fiscal_document_number: receiptSeq,
        fiscal_attribute: fpd,
        customer_email: buyerEmail,
        items: fiscalItems
      },
      metadata: {
        pass_code: passCode,
        holder_name: buyerName,
        promo_applied: checkoutState.promoCode || "none"
      },
      created_at: now.toISOString()
    }
  };

  const jsonText = JSON.stringify(webhookPayload, null, 2);
  const webhookPre = document.getElementById("webhook-json-pre");
  if (webhookPre) webhookPre.textContent = jsonText;
  return jsonText;
}

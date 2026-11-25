import { PROMO_CODES, TICKET_TIERS } from "./event-data.js";
import { calculateOrderTotals, escapeHtml, formatRub } from "./pricing-engine.js";
import { renderSuccessReceiptAndTicket } from "./receipt-54fz.js";

const toastEl = document.getElementById("motion-toast");
const toastText = document.getElementById("motion-toast-text");
const checkoutModal = document.getElementById("checkout-modal");
const stepPayEl = document.getElementById("checkout-step-pay");
const stepProcEl = document.getElementById("checkout-step-processing");
const stepSuccessEl = document.getElementById("checkout-step-success");

let toastTimer = null;
let receiptSeq = 14927;
let lastWebhookJson = "";

export function showToast(msg) {
  if (!toastEl || !toastText) return;
  toastText.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2300);
}

export function copyToClipboard(text, message) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      showToast("Скопируйте значение вручную");
    });
    return;
  }
  showToast("Скопируйте значение вручную");
}

function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("ring-2", "ring-flame");
  inputEl.focus();
  showToast(message);
  setTimeout(() => {
    inputEl.classList.remove("ring-2", "ring-flame");
  }, 2200);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function renderCheckoutSummary(state) {
  const calc = calculateOrderTotals(state);

  const pillsWrap = document.getElementById("modal-tier-pills");
  if (pillsWrap) {
    pillsWrap.innerHTML = TICKET_TIERS.map((t) => {
      const active = t.id === state.tierId;
      return `<button type="button" data-modal-tier="${escapeHtml(t.id)}" class="py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
        active
          ? "bg-obsidian-900 text-white border-obsidian-900"
          : "bg-white text-obsidian-600 border-obsidian-900/12 hover:border-obsidian-900"
      }">${escapeHtml(t.name.split(" ")[0])}</button>`;
    }).join("");

    pillsWrap.querySelectorAll("[data-modal-tier]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tierId = btn.dataset.modalTier;
        renderCheckoutSummary(state);
      });
    });
  }

  const qtyVal = document.getElementById("qty-value");
  const lineLabel = document.getElementById("summary-line-label");
  const subEl = document.getElementById("summary-subtotal");
  const discRow = document.getElementById("summary-discount-row");
  const discVal = document.getElementById("summary-discount-val");
  const finalEl = document.getElementById("summary-final-total");
  const payBtn = document.getElementById("pay-submit-btn");

  if (qtyVal) qtyVal.textContent = String(state.qty);
  if (lineLabel) {
    lineLabel.textContent = `${calc.tier.name} × ${state.qty}${state.addonWorkshop ? " + Воркшоп" : ""}`;
  }
  if (subEl) subEl.textContent = formatRub(calc.subtotal);
  if (discRow) discRow.classList.toggle("hidden", !calc.discount);
  if (discVal) discVal.textContent = `−${formatRub(calc.discount)}`;
  if (finalEl) finalEl.textContent = formatRub(calc.total);
  if (payBtn) {
    payBtn.textContent =
      state.payMethod === "sbp"
        ? `Подтвердить оплату по СБП · ${formatRub(calc.total)} →`
        : `Оплатить ${formatRub(calc.total)} (Тестовая оплата) →`;
  }
}

export function setPaymentMethod(state, method) {
  state.payMethod = method;
  document.querySelectorAll(".pay-method-btn").forEach((btn) => {
    const active = btn.dataset.payMethod === method;
    btn.className = active
      ? "pay-method-btn px-4 py-3 rounded-xl border-2 border-flame bg-white text-left flex items-center justify-between gap-2 cursor-pointer transition-all"
      : "pay-method-btn px-4 py-3 rounded-xl border border-obsidian-900/15 bg-white/60 hover:bg-white text-left flex items-center justify-between gap-2 cursor-pointer transition-all";
    const dot = btn.querySelector("span:last-child");
    if (dot) {
      dot.className = active
        ? "w-2.5 h-2.5 rounded-full bg-flame shrink-0"
        : "w-2.5 h-2.5 rounded-full border border-obsidian-900/25 shrink-0";
    }
  });

  document.getElementById("method-card-panel")?.classList.toggle("hidden", method !== "card");
  document.getElementById("method-sbp-panel")?.classList.toggle("hidden", method !== "sbp");
  document.getElementById("payment-error-box")?.classList.add("hidden");
  renderCheckoutSummary(state);
}

export function showCheckoutStep(step) {
  stepPayEl?.classList.toggle("hidden", step !== "pay");
  stepProcEl?.classList.toggle("hidden", step !== "processing");
  stepProcEl?.classList.toggle("flex", step === "processing");
  stepSuccessEl?.classList.toggle("hidden", step !== "success");
  stepSuccessEl?.classList.toggle("flex", step === "success");
}

export function switchSuccessTab(tab) {
  document.querySelectorAll(".success-tab-btn").forEach((btn) => {
    const active = btn.dataset.successTab === tab;
    btn.className = active
      ? "success-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold bg-obsidian-900 text-white cursor-pointer"
      : "success-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold text-obsidian-600 hover:text-obsidian-900 cursor-pointer";
  });
  document.getElementById("success-view-receipt")?.classList.toggle("hidden", tab !== "receipt");
  document.getElementById("success-view-webhook")?.classList.toggle("hidden", tab !== "webhook");
}

export function openCheckoutModal(state, tierId = "pro") {
  state.tierId = tierId;
  showCheckoutStep("pay");
  document.getElementById("payment-error-box")?.classList.add("hidden");
  setPaymentMethod(state, state.payMethod);
  renderCheckoutSummary(state);

  checkoutModal?.classList.add("is-open");
  checkoutModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeCheckoutModal() {
  checkoutModal?.classList.remove("is-open");
  checkoutModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function bindCheckoutTriggers(scope, state) {
  (scope || document).querySelectorAll(".open-checkout-trigger").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openCheckoutModal(state, el.dataset.openCheckout || "pro");
    });
  });
}

export function initCheckoutModal(state) {
  document.getElementById("qty-minus-btn")?.addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    renderCheckoutSummary(state);
  });

  document.getElementById("qty-plus-btn")?.addEventListener("click", () => {
    state.qty = Math.min(10, state.qty + 1);
    renderCheckoutSummary(state);
  });

  document.getElementById("addon-workshop-cb")?.addEventListener("change", (e) => {
    state.addonWorkshop = e.target.checked;
    renderCheckoutSummary(state);
  });

  document.getElementById("apply-promo-btn")?.addEventListener("click", () => {
    const input = document.getElementById("promo-code-input");
    const status = document.getElementById("promo-status-msg");
    const code = (input?.value || "").trim().toUpperCase();
    if (!status) return;
    status.classList.remove("hidden");

    if (PROMO_CODES[code]) {
      state.promoCode = code;
      status.className = "text-[11px] font-mono text-emerald-700 font-semibold";
      status.textContent = `✓ Применён промокод ${code} (${PROMO_CODES[code].label})`;
    } else {
      state.promoCode = null;
      status.className = "text-[11px] font-mono text-rose-600";
      status.textContent = "Промокод не найден. Попробуйте EARLY20";
    }
    renderCheckoutSummary(state);
  });

  document.querySelectorAll(".pay-method-btn").forEach((btn) => {
    btn.addEventListener("click", () => setPaymentMethod(state, btn.dataset.payMethod));
  });

  const cardNumberInput = document.getElementById("card-number");
  document.querySelectorAll(".test-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.testCard;
      if (!cardNumberInput) return;
      cardNumberInput.value = mode === "decline" ? "2200 7001 0000 0002" : "2200 7001 0000 0042";
      document.getElementById("payment-error-box")?.classList.add("hidden");
      showToast(mode === "decline" ? "Подставлена тестовая карта с отказом банка" : "Подставлена успешная тестовая карта МИР");
    });
  });

  document.getElementById("fix-test-card-btn")?.addEventListener("click", () => {
    if (cardNumberInput) cardNumberInput.value = "2200 7001 0000 0042";
    document.getElementById("payment-error-box")?.classList.add("hidden");
  });

  cardNumberInput?.addEventListener("input", () => {
    const digits = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
    cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  });

  document.getElementById("sandbox-payment-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("buyer-name");
    const emailInput = document.getElementById("buyer-email");
    const buyerName = (nameInput?.value || "").trim();
    const buyerEmail = (emailInput?.value || "").trim();

    if (buyerName.length < 2) {
      markFieldInvalid(nameInput, "Укажите имя участника (минимум 2 символа)");
      return;
    }
    if (!isValidEmail(buyerEmail)) {
      markFieldInvalid(emailInput, "Укажите корректный email для чека 54-ФЗ");
      return;
    }

    const rawCard = (cardNumberInput?.value || "").replace(/\s+/g, "");
    const isDeclineTest = state.payMethod === "card" && rawCard.endsWith("0002");

    showCheckoutStep("processing");
    const procTitle = document.getElementById("processing-title");
    const procSub = document.getElementById("processing-sub");
    if (procTitle) {
      procTitle.textContent =
        state.payMethod === "sbp"
          ? "Подтверждение операции в НСПК (СБП)..."
          : "Проверка 3-D Secure в шлюзе ЮKassa...";
    }
    if (procSub) procSub.textContent = "Авторизация платежа и запрос фискализации...";

    setTimeout(() => {
      if (isDeclineTest) {
        showCheckoutStep("pay");
        document.getElementById("payment-error-box")?.classList.remove("hidden");
        return;
      }

      if (procTitle) procTitle.textContent = "Регистрация чека 54-ФЗ в ОФД...";
      if (procSub) procSub.textContent = "Формируем ФД, ФПД и именной QR-билет...";

      setTimeout(() => {
        receiptSeq += 1;
        lastWebhookJson = renderSuccessReceiptAndTicket(state, buyerName, buyerEmail, receiptSeq);
        switchSuccessTab("receipt");
        showCheckoutStep("success");
      }, 620);
    }, 720);
  });

  document.querySelectorAll(".success-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchSuccessTab(btn.dataset.successTab));
  });

  document.getElementById("copy-webhook-json")?.addEventListener("click", () => {
    if (lastWebhookJson) copyToClipboard(lastWebhookJson, "JSON webhook ЮKassa (54-ФЗ) скопирован");
  });

  document.getElementById("checkout-new-test-btn")?.addEventListener("click", () => {
    showCheckoutStep("pay");
  });

  document.getElementById("checkout-close-btn")?.addEventListener("click", closeCheckoutModal);
  checkoutModal?.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });
}

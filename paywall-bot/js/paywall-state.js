import { TARIFFS } from "./club-data.js";

/**
 * Escapes HTML special characters to prevent XSS in dynamic markup.
 * @param {unknown} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

export function getNowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export function generateOneTimeLink() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let hash = "";
  for (let i = 0; i < 12; i += 1) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `https://t.me/+Rzv_${hash}`;
}

let toastTimer = null;

export function showToast(msg) {
  const toastEl = document.getElementById("club-toast");
  const toastText = document.getElementById("club-toast-text");
  if (!toastEl || !toastText) return;
  toastText.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2500);
}

export function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => showToast(message),
      () => showToast("Скопируйте значение вручную")
    );
    return;
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(message);
  } catch {
    showToast("Скопируйте значение вручную");
  }
}

export function createPaywallState() {
  return {
    status: "none",
    phoneTab: "bot",
    selectedTariff: TARIFFS[0],
    inPhonePayMethod: "sbp",
    inviteUrl: null,
    inviteUses: 0,
    inviteRevoked: false,
    expiresDateText: "—",
    currentDay: 0,
    isTyping: false,
    apiEventsLog: [],
    paymentSeq: 9104
  };
}

export function logBotApi(state, action, details) {
  state.apiEventsLog.unshift({
    timestamp: new Date().toISOString(),
    method: action,
    ...details
  });
  if (state.apiEventsLog.length > 10) state.apiEventsLog.pop();
  const pre = document.getElementById("bot-api-pre");
  if (pre) pre.textContent = JSON.stringify(state.apiEventsLog.slice(0, 4), null, 2);
}

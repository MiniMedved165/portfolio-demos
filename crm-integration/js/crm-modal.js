import {
  buildCrmSimulation,
  escapeHtml,
  formatRub,
  normalizeContactKey
} from "./crm-payloads.js";

const crmModal = document.getElementById("crm-api-modal");
const apiLogEl = document.getElementById("api-live-log");
const jsonPreEl = document.getElementById("crm-json-pre");
const toastEl = document.getElementById("sayso-toast");
const toastText = document.getElementById("sayso-toast-text");

let activeCrmProvider = "amocrm";
let activeJsonTab = "response";
let lastSubmissionData = null;
const knownContacts = new Map();
let dealSequenceCounter = 482916;
let logTimeouts = [];
let currentRequestObj = null;
let currentResponseObj = null;
let toastTimer = null;

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

function clearScheduledLogs() {
  logTimeouts.forEach((id) => clearTimeout(id));
  logTimeouts = [];
}

function renderJsonViewer() {
  document.querySelectorAll(".json-tab-btn").forEach((btn) => {
    const active = btn.dataset.jsonView === activeJsonTab;
    btn.className = active
      ? "json-tab-btn px-2.5 py-1 rounded bg-british-700 text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
      : "json-tab-btn px-2.5 py-1 rounded bg-white/10 text-gallery-bg/80 hover:text-white font-mono text-[10px] uppercase cursor-pointer";
  });

  const payload = activeJsonTab === "request" ? currentRequestObj : currentResponseObj;
  if (jsonPreEl && payload) {
    jsonPreEl.textContent = JSON.stringify(payload, null, 2);
  }
}

/**
 * Simulates an AmoCRM API v4 or Bitrix24 REST lead pipeline with duplicate check and live API log.
 * @param {object} lead
 * @param {"amocrm"|"bitrix24"} provider
 * @param {boolean} forceDuplicateTest
 */
export function runCrmIntegrationSimulation(lead, provider, forceDuplicateTest = false) {
  clearScheduledLogs();
  activeCrmProvider = provider;

  document.querySelectorAll(".crm-provider-btn").forEach((btn) => {
    const active = btn.dataset.crmProvider === provider;
    btn.className = active
      ? "crm-provider-btn px-4 py-2 rounded-full text-xs font-mono font-semibold bg-british-800 text-white cursor-pointer transition-all"
      : "crm-provider-btn px-4 py-2 rounded-full text-xs font-mono font-semibold text-ink-600 hover:text-ink-900 cursor-pointer transition-all";
  });

  const contactKey = normalizeContactKey(lead.phone);
  const alreadyExists = forceDuplicateTest || knownContacts.has(contactKey);
  let contactId;
  if (alreadyExists) {
    contactId = knownContacts.get(contactKey) || 849201;
    knownContacts.set(contactKey, contactId);
  } else {
    contactId = 849200 + knownContacts.size + 1;
    knownContacts.set(contactKey, contactId);
  }

  dealSequenceCounter += 1;
  const dealId = dealSequenceCounter;
  const taskId = dealId + 3104;
  const isAmo = provider === "amocrm";

  const sim = buildCrmSimulation(lead, provider, {
    contactId,
    alreadyExists,
    dealId,
    taskId,
    contactKey
  });
  currentRequestObj = sim.requestObj;
  currentResponseObj = sim.responseObj;

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl("deal-crm-badge", isAmo ? "AmoCRM v4" : "Битрикс24");
  setEl("deal-id-badge", `Сделка #${dealId}`);
  setEl("deal-status-pill", isAmo ? "201 Created" : "200 OK");
  setEl("deal-pipeline-stage", isAmo ? "Основная воронка → Назначен вводный урок" : "Воронка «Уроки» → C2:NEW · Вводный урок");
  setEl("deal-budget", formatRub(lead.budget));
  setEl("deal-contact-summary", `${lead.name} · contact_id #${contactId}`);
  setEl("deal-contact-meta", `${lead.phone}${lead.email ? ` · ${lead.email}` : ""}`);
  setEl("deal-auto-task", `Подтвердить вводный урок на «${lead.slot} (МСК)» и отправить ссылку на платформу`);
  setEl(
    "console-endpoint-label",
    isAmo
      ? "POST https://sayso.amocrm.ru/api/v4/leads/complex"
      : "POST https://sayso.bitrix24.ru/rest/1/***/crm.deal.add.json"
  );
  setEl("console-latency", isAmo ? "338 ms" : "312 ms");

  const dupEl = document.getElementById("deal-duplicate-status");
  if (dupEl) {
    dupEl.innerHTML = alreadyExists
      ? `<span class="text-amber-700 font-semibold">↺ Контакт #${contactId} найден в CRM — дубль предотвращён</span>`
      : `<span class="text-british-800">✓ Создан новый контакт #${contactId} и привязан к сделке</span>`;
  }

  const tagsWrap = document.getElementById("deal-tags-list");
  if (tagsWrap) {
    tagsWrap.innerHTML = sim.tags
      .map(
        (t) =>
          `<span class="px-2.5 py-1 rounded-full bg-gallery-warm border border-ink-900/10 font-mono text-[10.5px] text-ink-900 font-medium">#${escapeHtml(t)}</span>`
      )
      .join("");
  }

  renderJsonViewer();

  if (apiLogEl) apiLogEl.innerHTML = "";
  sim.steps.forEach((step) => {
    const timerId = setTimeout(() => {
      if (!apiLogEl) return;
      const row = document.createElement("div");
      row.className = "api-log-row flex items-start justify-between gap-3 py-1 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]";
      row.innerHTML = `
        <div class="min-w-0">
          <span class="${step.color} font-bold mr-1.5">[${escapeHtml(step.method)}]</span>
          <span class="text-gallery-bg/90 break-words">${escapeHtml(step.text)}</span>
        </div>
        <span class="text-emerald-400/90 shrink-0 text-[10px]">${escapeHtml(step.status)}</span>
      `;
      apiLogEl.appendChild(row);
    }, step.delay);
    logTimeouts.push(timerId);
  });
}

export function openCrmModal(leadData) {
  lastSubmissionData = leadData;
  crmModal?.classList.add("is-open");
  crmModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  runCrmIntegrationSimulation(leadData, activeCrmProvider, false);
}

export function closeCrmModal() {
  clearScheduledLogs();
  crmModal?.classList.remove("is-open");
  crmModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function initCrmModal() {
  document.querySelectorAll(".crm-provider-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!lastSubmissionData) return;
      runCrmIntegrationSimulation(lastSubmissionData, btn.dataset.crmProvider, false);
    });
  });

  document.querySelectorAll(".json-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeJsonTab = btn.dataset.jsonView;
      renderJsonViewer();
    });
  });

  document.getElementById("crm-test-duplicate-btn")?.addEventListener("click", () => {
    if (!lastSubmissionData) return;
    runCrmIntegrationSimulation(lastSubmissionData, activeCrmProvider, true);
    showToast("Повторный запрос выполнен: дубль контакта предотвращён");
  });

  document.getElementById("copy-crm-json-btn")?.addEventListener("click", () => {
    const text = jsonPreEl?.textContent || "";
    if (text) copyToClipboard(text, "JSON ответа API скопирован");
  });

  document.getElementById("crm-modal-close")?.addEventListener("click", closeCrmModal);
  document.getElementById("crm-modal-done-btn")?.addEventListener("click", closeCrmModal);
  crmModal?.addEventListener("click", (e) => {
    if (e.target === crmModal) closeCrmModal();
  });
}

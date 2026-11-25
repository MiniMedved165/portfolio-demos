import { CATEGORIES, READY_BUILDS, RGB_THEMES } from "./catalog-data.js";
import { escapeHtml, evaluateBuild, formatRub, getRgbTheme, getSelectedPart } from "./build-engine.js";

const toastEl = document.getElementById("hw-toast");
const toastText = document.getElementById("hw-toast-text");
let toastTimer = null;

const orderModal = document.getElementById("order-modal");
const orderFormView = document.getElementById("order-form-view");
const orderDemoResult = document.getElementById("order-demo-result");
const orderSubtitle = document.getElementById("order-summary-subtitle");
const orderRecap = document.getElementById("order-modal-recap");
const orderTotal = document.getElementById("order-modal-total");
const orderPayloadPre = document.getElementById("order-payload-pre");
let lastOrderJson = "";

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
      showToast("Скопируйте текст вручную");
    });
    return;
  }
  showToast("Скопируйте текст вручную");
}

function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("ring-2", "ring-accent-rose");
  inputEl.focus();
  showToast(message);
  setTimeout(() => {
    inputEl.classList.remove("ring-2", "ring-accent-rose");
  }, 2200);
}

function isValidContact(contact) {
  const trimmed = String(contact || "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 || /^@[a-zA-Z0-9_]{4,32}$/.test(trimmed);
}

export function renderRgbSwatches(state, onUpdate) {
  const wrap = document.getElementById("rig-rgb-swatches");
  if (!wrap) return;
  wrap.innerHTML = RGB_THEMES.map((t) => {
    const active = state.build.rgb === t.id;
    return `<button type="button" data-rgb-id="${escapeHtml(t.id)}" title="Подсветка: ${escapeHtml(t.name)}" aria-label="Подсветка ${escapeHtml(t.name)}" class="w-5 h-5 rounded-full transition-transform cursor-pointer ${
      active ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-void-950" : "opacity-75 hover:opacity-100"
    }" style="background: linear-gradient(135deg, ${t.primary}, ${t.secondary});"></button>`;
  }).join("");

  wrap.querySelectorAll("[data-rgb-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.build.rgb = btn.dataset.rgbId;
      onUpdate();
    });
  });
}

export function renderCategoryTabs(state, onUpdate) {
  const wrap = document.getElementById("config-cat-tabs");
  if (!wrap) return;

  wrap.innerHTML = CATEGORIES.map((cat, idx) => {
    const active = cat.id === state.activeCategoryId;
    return `<button type="button" data-cat-tab="${escapeHtml(cat.id)}" class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
      active
        ? "bg-white text-void-950 border-white shadow"
        : "bg-void-850 text-chrome-300 border-white/10 hover:border-white/30 hover:text-white"
    }">
      <span class="font-mono text-[10px] ${active ? "text-accent-rose font-bold" : "text-chrome-500"}">0${idx + 1}</span>
      <span>${escapeHtml(cat.label)}</span>
    </button>`;
  }).join("");

  wrap.querySelectorAll("[data-cat-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeCategoryId = btn.dataset.catTab;
      onUpdate();
    });
  });

  const curIdx = CATEGORIES.findIndex((c) => c.id === state.activeCategoryId);
  const prevBtn = document.getElementById("cat-prev-btn");
  const nextBtn = document.getElementById("cat-next-btn");
  const stepCounter = document.getElementById("cat-step-counter");
  if (prevBtn) prevBtn.disabled = curIdx <= 0;
  if (nextBtn) nextBtn.textContent = curIdx >= CATEGORIES.length - 1 ? "Оформить сборку →" : "Следующий компонент →";
  if (stepCounter) stepCounter.textContent = `${curIdx + 1} / ${CATEGORIES.length}`;
}

export function renderActiveOptions(state, onUpdate) {
  const container = document.getElementById("config-options-container");
  if (!container) return;

  const cat = CATEGORIES.find((c) => c.id === state.activeCategoryId) || CATEGORIES[0];
  const currentSelected = getSelectedPart(state.build, cat.id);

  container.innerHTML = `
    <div class="rounded-[24px] bg-void-850 border border-white/8 p-5 sm:p-6 flex flex-col gap-5">
      <div>
        <h3 class="text-lg sm:text-xl font-bold text-white">${escapeHtml(cat.title)}</h3>
        <p class="text-xs text-chrome-300 mt-1">${escapeHtml(cat.hint)}</p>
      </div>

      <div class="grid grid-cols-1 gap-3">
        ${cat.items
          .map((item) => {
            const isSel = item.id === state.build[cat.id];
            const delta = item.price - (currentSelected?.price || 0);
            const deltaText = isSel
              ? "Выбрано"
              : delta > 0
                ? `+${formatRub(delta)}`
                : `−${formatRub(Math.abs(delta))}`;

            const colorSwatch =
              cat.id === "case"
                ? `<span class="w-4 h-4 rounded-full border border-white/25 shrink-0" style="background:${item.visual.shell}"></span>`
                : "";

            return `<button type="button" data-pick-cat="${escapeHtml(cat.id)}" data-pick-id="${escapeHtml(item.id)}" class="part-option ${isSel ? "is-selected" : ""} w-full text-left p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer">
              <div class="flex items-start gap-3.5 min-w-0">
                <span class="mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isSel ? "bg-accent-rose border-accent-rose text-white" : "border-white/25 text-transparent"
                }">✓</span>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    ${colorSwatch}
                    <span class="text-sm font-bold text-white">${escapeHtml(item.name)}</span>
                    ${item.badge ? `<span class="px-2 py-0.5 rounded-full bg-accent-rose/20 text-[#FF99C6] font-mono text-[10px] font-semibold">${escapeHtml(item.badge)}</span>` : ""}
                  </div>
                  <p class="text-xs text-chrome-300 mt-1">${escapeHtml(item.spec)}</p>
                </div>
              </div>

              <div class="flex sm:flex-col items-center sm:items-end justify-between pl-8 sm:pl-0 shrink-0 gap-1">
                <span class="font-mono text-sm font-bold text-white">${escapeHtml(formatRub(item.price))}</span>
                <span class="font-mono text-[11px] ${isSel ? "text-accent-rose font-semibold" : delta > 0 ? "text-chrome-500" : "text-emerald-400"}">${escapeHtml(deltaText)}</span>
              </div>
            </button>`;
          })
          .join("")}
      </div>
    </div>
  `;

  container.querySelectorAll("[data-pick-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const catId = btn.dataset.pickCat;
      const partId = btn.dataset.pickId;
      state.build[catId] = partId;

      const evalCheck = evaluateBuild(state.build);
      if (!evalCheck.psuOk && catId !== "psu") {
        state.build.psu = "psu1000";
        showToast("Блок питания автоматически усилен до 1000 Вт под нагрузку");
      }

      onUpdate();
    });
  });
}

export function renderEstimatePanel(evalData, state, onUpdate) {
  const bomList = document.getElementById("estimate-bom-list");
  const totalEl = document.getElementById("estimate-total-price");
  const headerPrice = document.getElementById("header-live-price");
  const monthlyEl = document.getElementById("estimate-monthly");
  const fpsCp = document.getElementById("metric-fps-cp");
  const fpsCs = document.getElementById("metric-fps-cs");
  const psuLoad = document.getElementById("metric-psu-load");
  const compatBadge = document.getElementById("estimate-compat-badge");

  if (totalEl) totalEl.textContent = formatRub(evalData.total);
  if (headerPrice) headerPrice.textContent = formatRub(evalData.total);
  if (monthlyEl) monthlyEl.textContent = `от ${formatRub(Math.round(evalData.total / 12))} / мес`;
  if (fpsCp) fpsCp.textContent = `${evalData.cpFps} FPS`;
  if (fpsCs) fpsCs.textContent = `${evalData.csFps} FPS`;

  if (psuLoad) {
    psuLoad.textContent = `${evalData.tdp} / ${evalData.psuWatts} Вт`;
    psuLoad.className = `font-mono text-sm sm:text-base font-bold mt-0.5 ${
      evalData.psuOk ? "text-emerald-400" : "text-amber-400"
    }`;
  }

  if (compatBadge) {
    compatBadge.innerHTML = evalData.psuOk
      ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>100% совместимо</span>`
      : `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span class="text-amber-400">Рекомендуем БП мощнее</span>`;
  }

  if (bomList) {
    bomList.innerHTML = CATEGORIES.map((cat) => {
      const p = evalData.parts[cat.id];
      const isCurrent = cat.id === state.activeCategoryId;
      return `<li data-bom-jump="${escapeHtml(cat.id)}" class="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
        isCurrent ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      }">
        <div class="min-w-0 flex items-center gap-2">
          <span class="text-[10px] font-mono uppercase text-chrome-500 w-16 shrink-0">${escapeHtml(cat.label)}</span>
          <span class="text-chrome-100 truncate font-medium">${escapeHtml(p.name)}</span>
        </div>
        <span class="font-mono text-chrome-300 shrink-0">${escapeHtml(formatRub(p.price))}</span>
      </li>`;
    }).join("");

    bomList.querySelectorAll("[data-bom-jump]").forEach((li) => {
      li.addEventListener("click", () => {
        state.activeCategoryId = li.dataset.bomJump;
        onUpdate();
      });
    });
  }
}

export function bindPresetTriggers(scope, onLoadPreset) {
  (scope || document).querySelectorAll(".preset-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = READY_BUILDS.find((r) => r.id === btn.dataset.loadPreset);
      if (!preset) return;
      onLoadPreset(preset);
    });
  });
}

export function renderReadyBuilds(onLoadPreset) {
  const listEl = document.getElementById("ready-builds-list");
  if (!listEl) return;

  listEl.innerHTML = READY_BUILDS.map((b) => {
    const ev = evaluateBuild(b.config);
    return `<article class="ready-row py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
      <div class="lg:col-span-3">
        <div class="text-base sm:text-lg font-bold text-white">${escapeHtml(b.name)}</div>
        <div class="text-xs text-chrome-500 mt-0.5">${escapeHtml(b.tagline)}</div>
      </div>

      <div class="lg:col-span-6 flex flex-wrap gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-void-850 border border-white/8 text-[11px] font-mono text-chrome-100">${escapeHtml(ev.parts.gpu.name.replace("GeForce ", ""))}</span>
        <span class="px-3 py-1.5 rounded-xl bg-void-850 border border-white/8 text-[11px] font-mono text-chrome-300">${escapeHtml(ev.parts.cpu.name)}</span>
        <span class="px-3 py-1.5 rounded-xl bg-void-850 border border-white/8 text-[11px] font-mono text-chrome-300">${escapeHtml(ev.parts.ram.name.split(" ")[0])} ГБ DDR5</span>
        <span class="px-3 py-1.5 rounded-xl bg-void-850 border border-white/8 text-[11px] font-mono text-chrome-300">${ev.cpFps} FPS (2K)</span>
      </div>

      <div class="lg:col-span-2 flex lg:justify-end items-baseline gap-2">
        <span class="font-mono text-lg font-bold text-white">${escapeHtml(formatRub(ev.total))}</span>
      </div>

      <div class="lg:col-span-1 flex lg:justify-end">
        <button type="button" data-load-preset="${escapeHtml(b.id)}" class="preset-trigger px-4 py-2 rounded-full bg-void-800 hover:bg-accent-rose border border-white/12 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap">
          Изменить →
        </button>
      </div>
    </article>`;
  }).join("");

  bindPresetTriggers(listEl, onLoadPreset);
}

export function openOrderModal(state) {
  const ev = evaluateBuild(state.build);
  const rgb = getRgbTheme(state.build);

  orderFormView?.classList.remove("hidden");
  orderDemoResult?.classList.add("hidden");
  orderDemoResult?.classList.remove("flex");

  if (orderSubtitle) {
    orderSubtitle.textContent = `${ev.parts.case.name} · Подсветка ${rgb.name} · Прогноз ${ev.cpFps} FPS в 2K`;
  }
  if (orderTotal) orderTotal.textContent = formatRub(ev.total);

  if (orderRecap) {
    orderRecap.innerHTML = CATEGORIES.map((cat) => {
      const p = ev.parts[cat.id];
      return `<div class="flex items-center justify-between gap-2">
        <span class="text-chrome-500">${escapeHtml(cat.label)}: <strong class="text-chrome-100 font-medium">${escapeHtml(p.name)}</strong></span>
        <span class="font-mono text-chrome-300 shrink-0">${escapeHtml(formatRub(p.price))}</span>
      </div>`;
    }).join("");
  }

  orderModal?.classList.add("is-open");
  orderModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeOrderModal() {
  orderModal?.classList.remove("is-open");
  orderModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function initOrderModal(state) {
  document.getElementById("open-order-modal-btn")?.addEventListener("click", () => openOrderModal(state));
  document.getElementById("header-build-btn")?.addEventListener("click", () => openOrderModal(state));
  document.getElementById("order-modal-close")?.addEventListener("click", closeOrderModal);
  document.getElementById("order-result-close")?.addEventListener("click", closeOrderModal);
  orderModal?.addEventListener("click", (e) => {
    if (e.target === orderModal) closeOrderModal();
  });

  document.getElementById("pc-order-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("order-name");
    const contactInput = document.getElementById("order-contact");
    const customerName = (nameInput?.value || "").trim();
    const customerContact = (contactInput?.value || "").trim();

    if (customerName.length < 2) {
      markFieldInvalid(nameInput, "Укажите ваше имя (минимум 2 символа)");
      return;
    }
    if (!isValidContact(customerContact)) {
      markFieldInvalid(contactInput, "Укажите телефон (от 10 цифр) или @telegram");
      return;
    }

    const ev = evaluateBuild(state.build);
    const rgb = getRgbTheme(state.build);

    const bom = {};
    CATEGORIES.forEach((cat) => {
      bom[cat.id] = {
        name: ev.parts[cat.id].name,
        price_rub: ev.parts[cat.id].price
      };
    });

    const payload = {
      source: "/hardware. PC Configurator",
      customer: {
        name: customerName,
        contact: customerContact,
        delivery: document.getElementById("order-delivery")?.value || ""
      },
      configuration: {
        lighting_theme: rgb.name,
        components: bom,
        estimated_tdp_watts: ev.tdp,
        psu_watts: ev.psuWatts,
        estimated_2k_fps: ev.cpFps,
        total_price_rub: ev.total
      },
      timestamp: new Date().toISOString()
    };

    lastOrderJson = JSON.stringify(payload, null, 2);
    if (orderPayloadPre) orderPayloadPre.textContent = lastOrderJson;

    orderFormView?.classList.add("hidden");
    orderDemoResult?.classList.remove("hidden");
    orderDemoResult?.classList.add("flex");
  });

  document.getElementById("copy-order-json")?.addEventListener("click", () => {
    if (lastOrderJson) copyToClipboard(lastOrderJson, "JSON спецификации скопирован");
  });

  document.getElementById("copy-spec-btn")?.addEventListener("click", () => {
    const ev = evaluateBuild(state.build);
    const lines = [
      "Конфигурация ПК (/hardware.):",
      ...CATEGORIES.map((c) => `• ${c.label}: ${ev.parts[c.id].name} — ${formatRub(ev.parts[c.id].price)}`),
      `• Подсветка: ${getRgbTheme(state.build).name}`,
      `Итого: ${formatRub(ev.total)} (Сборка и тест 24ч включены)`
    ].join("\n");
    copyToClipboard(lines, "Спецификация сборки скопирована");
  });
}

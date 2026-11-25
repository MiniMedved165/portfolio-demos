import { PRESET_SKUS } from "./sku-presets.js";
import {
  escapeHtml,
  formatRub,
  getNowTime,
  getTotalStock,
  getDaysRemaining,
  showToast,
  copyToClipboard,
  synthesizeCustomSku
} from "./sku-synthesizer.js";
import { renderWarehouses } from "./warehouses-ui.js";
import { renderDynamicChart } from "./chart-renderer.js";
import { openAlertModal, closeAlertModal, exportWatchlistCsv } from "./export-alerts.js";

const watchlist = PRESET_SKUS.map((item) => ({ ...item }));

const state = {
  inputMp: "wb",
  activeSku: PRESET_SKUS[0].sku,
  whSort: "risk",
  chartMetric: "rating",
  isLoading: false,
  lastAlertText: ""
};

function getActiveProduct() {
  return watchlist.find((p) => p.sku === state.activeSku) || watchlist[0];
}

function syncMarketplaceSwitch(mp) {
  state.inputMp = mp;
  const tag = document.getElementById("input-mp-tag");
  const input = document.getElementById("sku-input");

  document.querySelectorAll(".mp-switch-btn").forEach((btn) => {
    const active = btn.dataset.mpSwitch === mp;
    if (active && mp === "wb") {
      btn.className = "mp-switch-btn px-4 py-2 rounded-lg text-xs font-bold bg-wb text-white shadow-sm cursor-pointer transition-all";
    } else if (active && mp === "ozon") {
      btn.className = "mp-switch-btn px-4 py-2 rounded-lg text-xs font-bold bg-ozon text-white shadow-sm cursor-pointer transition-all";
    } else {
      btn.className = "mp-switch-btn px-4 py-2 rounded-lg text-xs font-bold text-plumink-500 hover:text-plumink-900 cursor-pointer transition-all";
    }
  });

  if (tag) {
    tag.textContent = mp === "wb" ? "WB" : "OZ";
    tag.className =
      mp === "wb"
        ? "absolute left-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-wb-soft text-wb font-mono text-[10.5px] font-bold"
        : "absolute left-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-ozon-soft text-ozon font-mono text-[10.5px] font-bold";
  }
  if (input) {
    input.classList.toggle("focus:border-wb", mp === "wb");
    input.classList.toggle("focus:border-ozon", mp === "ozon");
  }
}

function renderPresetSkus() {
  const bar = document.getElementById("preset-skus-bar");
  if (!bar) return;

  bar.innerHTML = PRESET_SKUS.map((p) => {
    const active = p.sku === state.activeSku;
    const isWb = p.mp === "wb";
    return `<button type="button" data-preset-sku="${escapeHtml(p.sku)}" class="preset-sku-btn px-3 py-1 rounded-full border font-mono text-[11px] transition-all cursor-pointer ${
      active
        ? isWb
          ? "bg-wb text-white border-wb font-semibold"
          : "bg-ozon text-white border-ozon font-semibold"
        : "bg-porcelain-50 text-plumink-700 border-porcelain-200 hover:border-plumink-400"
    }">
      <span class="${active ? "text-white/85" : isWb ? "text-wb font-bold" : "text-ozon font-bold"}">${isWb ? "WB" : "OZ"}</span>
      <span>${escapeHtml(p.sku)}</span>
    </button>`;
  }).join("");

  bar.querySelectorAll(".preset-sku-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sku = btn.dataset.presetSku;
      const found = watchlist.find((w) => w.sku === sku);
      if (!found) return;
      const input = document.getElementById("sku-input");
      if (input) input.value = found.sku;
      syncMarketplaceSwitch(found.mp);
      fetchAndDisplaySku(found.sku, found.mp);
    });
  });
}

function renderProductOverview(prod, animate = false) {
  const passportEl = document.getElementById("product-passport-card");
  const kpiEl = document.getElementById("sku-kpi-grid");
  if (!passportEl || !kpiEl) return;

  const isWb = prod.mp === "wb";
  const totalStock = getTotalStock(prod);
  const daysLeft = getDaysRemaining(prod);
  const estRevenue14 = prod.buyerPrice * prod.ordersPerDay * 14;
  const orders14 = prod.ordersPerDay * 14;
  const stockHealthCls =
    daysLeft <= 7
      ? "text-crit-600"
      : daysLeft <= 15
        ? "text-warn-600"
        : "text-ok-600";

  passportEl.innerHTML = `
    <div class="w-full sm:w-32 h-40 sm:h-36 rounded-2xl overflow-hidden bg-porcelain-100 border border-porcelain-200 shrink-0 relative">
      <img src="${escapeHtml(prod.image)}" alt="${escapeHtml(prod.name)}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/300x340/F1EFF6/171324?text=SKU'">
      <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold text-white shadow ${isWb ? "bg-wb" : "bg-ozon"}">
        ${isWb ? "WB" : "Ozon"}
      </span>
    </div>

    <div class="${animate ? "panel-animate" : ""} flex-1 min-w-0 flex flex-col justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="text-[11px] font-mono uppercase tracking-wider font-bold ${isWb ? "text-wb" : "text-ozon"}">${escapeHtml(prod.brand)}</span>
          <span class="text-plumink-400">·</span>
          <span class="text-[11px] text-plumink-500 truncate">${escapeHtml(prod.category)}</span>
        </div>
        <h2 class="text-base sm:text-lg font-extrabold text-plumink-900 leading-snug">
          ${escapeHtml(prod.name)}
        </h2>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-porcelain-100">
        <button type="button" id="copy-active-sku" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-porcelain-50 hover:bg-porcelain-100 border border-porcelain-200 font-mono text-xs font-semibold text-plumink-900 cursor-pointer transition-colors">
          <span>Арт. ${escapeHtml(prod.sku)}</span>
          <span class="text-plumink-400 text-[10px]">❐</span>
        </button>
        <span class="px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold ${
          daysLeft <= 7
            ? "bg-crit-50 text-crit-600 border border-crit-100"
            : "bg-ok-50 text-ok-600 border border-ok-100"
        }">
          ${daysLeft <= 7 ? `⚠ Риск обнуления (${daysLeft} дн.)` : `✓ В наличии · ~${daysLeft} дн.`}
        </span>
      </div>
    </div>
  `;

  document.getElementById("copy-active-sku")?.addEventListener("click", () => {
    copyToClipboard(prod.sku, `Артикул ${prod.sku} скопирован`);
  });

  kpiEl.innerHTML = `
    <div class="${animate ? "panel-animate" : ""} rounded-2xl bg-white border border-porcelain-200 p-4 sm:p-5 flex flex-col justify-between gap-2 shadow-[0_4px_16px_-10px_rgba(23,19,36,0.06)]">
      <div class="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-plumink-500">
        <span>Цена покупателя</span>
        <span class="px-2 py-0.5 rounded-md font-bold ${isWb ? "bg-wb-soft text-wb" : "bg-ozon-soft text-ozon"}">
          ${isWb ? `СПП −${prod.sppPercent}%` : `Ozon Карта −${prod.sppPercent}%`}
        </span>
      </div>
      <div>
        <div class="flex items-baseline gap-2.5">
          <span class="font-mono text-2xl sm:text-3xl font-bold text-plumink-900">${formatRub(prod.buyerPrice)}</span>
          <span class="font-mono text-xs text-plumink-400 line-through">${formatRub(prod.basePrice)}</span>
        </div>
        <div class="text-[11px] font-mono text-plumink-500 mt-1">Цена продавца до скидки МП: <strong class="text-plumink-900">${formatRub(prod.sellerPrice)}</strong></div>
      </div>
    </div>

    <div class="${animate ? "panel-animate" : ""} rounded-2xl bg-white border ${daysLeft <= 7 ? "border-crit-600/40 bg-crit-50/30" : "border-porcelain-200"} p-4 sm:p-5 flex flex-col justify-between gap-2 shadow-[0_4px_16px_-10px_rgba(23,19,36,0.06)]">
      <div class="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-plumink-500">
        <span>Суммарный остаток</span>
        <span class="font-bold ${stockHealthCls}">~${daysLeft} дн. продаж</span>
      </div>
      <div>
        <div class="flex items-baseline gap-2">
          <span class="font-mono text-2xl sm:text-3xl font-bold text-plumink-900">${totalStock.toLocaleString("ru-RU")}</span>
          <span class="text-xs font-mono text-plumink-500">шт.</span>
        </div>
        <div class="text-[11px] font-mono text-plumink-500 mt-1">
          Ср. скорость: <strong class="text-plumink-900">${prod.ordersPerDay} шт/день</strong> · 6 складов
        </div>
      </div>
    </div>

    <div class="${animate ? "panel-animate" : ""} rounded-2xl bg-white border border-porcelain-200 p-4 sm:p-5 flex flex-col justify-between gap-2 shadow-[0_4px_16px_-10px_rgba(23,19,36,0.06)]">
      <div class="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-plumink-500">
        <span>Рейтинг карточки</span>
        <span class="px-2 py-0.5 rounded-md font-bold ${prod.ratingDelta >= 0 ? "bg-ok-50 text-ok-600" : "bg-crit-50 text-crit-600"}">
          ${prod.ratingDelta >= 0 ? `+${prod.ratingDelta.toFixed(2)}` : prod.ratingDelta.toFixed(2)} за 14д
        </span>
      </div>
      <div>
        <div class="flex items-baseline gap-2">
          <span class="font-mono text-2xl sm:text-3xl font-bold text-plumink-900">${prod.rating.toFixed(2)}</span>
          <span class="text-amber-500 text-lg">★</span>
        </div>
        <div class="text-[11px] font-mono text-plumink-500 mt-1">На основе <strong class="text-plumink-900">${prod.reviewsCount.toLocaleString("ru-RU")}</strong> отзывов</div>
      </div>
    </div>

    <div class="${animate ? "panel-animate" : ""} rounded-2xl bg-white border border-porcelain-200 p-4 sm:p-5 flex flex-col justify-between gap-2 shadow-[0_4px_16px_-10px_rgba(23,19,36,0.06)]">
      <div class="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-plumink-500">
        <span>Оценка выручки (14 дн.)</span>
        <span class="text-plumink-400">FBO</span>
      </div>
      <div>
        <div class="font-mono text-2xl sm:text-3xl font-bold text-plumink-900">${formatRub(estRevenue14)}</div>
        <div class="text-[11px] font-mono text-plumink-500 mt-1">~${orders14.toLocaleString("ru-RU")} заказов · выкуп 91%</div>
      </div>
    </div>
  `;
}

function renderWatchlist() {
  const tbody = document.getElementById("watchlist-tbody");
  const pill = document.getElementById("watchlist-count-pill");
  if (!tbody) return;
  if (pill) pill.textContent = `${watchlist.length} артикула`;

  tbody.innerHTML = watchlist
    .map((p) => {
      const active = p.sku === state.activeSku;
      const isWb = p.mp === "wb";
      const total = getTotalStock(p);
      const days = getDaysRemaining(p);
      const isRisk = days <= 7;

      return `<tr data-watch-sku="${escapeHtml(p.sku)}" class="${active ? "bg-porcelain-100/90" : "bg-white hover:bg-porcelain-50"} transition-colors cursor-pointer">
        <td class="py-3.5 pl-5 pr-3">
          <div class="flex items-center gap-3">
            <img src="${escapeHtml(p.image)}" alt="" class="w-10 h-10 rounded-xl object-cover bg-porcelain-100 border border-porcelain-200 shrink-0">
            <div class="min-w-0">
              <div class="font-bold text-[13px] text-plumink-900 truncate max-w-[300px]">${escapeHtml(p.name)}</div>
              <div class="text-[11px] text-plumink-500">${escapeHtml(p.brand)} · ${escapeHtml(p.category)}</div>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-3 font-mono">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold ${isWb ? "bg-wb-soft text-wb" : "bg-ozon-soft text-ozon"}">
            ${isWb ? "WB" : "Ozon"}
          </span>
          <div class="text-xs font-semibold text-plumink-900 mt-1">${escapeHtml(p.sku)}</div>
        </td>
        <td class="py-3.5 px-3 font-mono">
          <div class="font-bold text-plumink-900">${formatRub(p.buyerPrice)}</div>
          <div class="text-[10.5px] text-plumink-400">прод. ${formatRub(p.sellerPrice)} (−${p.sppPercent}%)</div>
        </td>
        <td class="py-3.5 px-3 font-mono">
          <div class="font-bold ${isRisk ? "text-crit-600" : "text-plumink-900"}">${total.toLocaleString("ru-RU")} шт</div>
          <div class="text-[10.5px] ${isRisk ? "text-crit-600 font-semibold" : "text-plumink-500"}">~${days} дн. (${p.ordersPerDay}/д)</div>
        </td>
        <td class="py-3.5 px-3 font-mono">
          <div class="font-bold text-plumink-900">★ ${p.rating.toFixed(2)}</div>
          <div class="text-[10.5px] ${p.ratingDelta >= 0 ? "text-ok-600" : "text-crit-600"}">
            ${p.ratingDelta >= 0 ? `+${p.ratingDelta.toFixed(2)}` : p.ratingDelta.toFixed(2)} за 14д
          </div>
        </td>
        <td class="py-3.5 pl-3 pr-5 text-right">
          ${
            isRisk
              ? `<span class="px-2.5 py-1 rounded-full bg-crit-50 border border-crit-100 font-mono text-[10px] font-bold text-crit-600 uppercase">Поставка!</span>`
              : `<span class="px-2.5 py-1 rounded-full bg-ok-50 border border-ok-100 font-mono text-[10px] font-semibold text-ok-600 uppercase">В норме</span>`
          }
        </td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("tr[data-watch-sku]").forEach((tr) => {
    tr.addEventListener("click", () => {
      const sku = tr.dataset.watchSku;
      const found = watchlist.find((w) => w.sku === sku);
      if (!found) return;
      const input = document.getElementById("sku-input");
      if (input) input.value = found.sku;
      syncMarketplaceSwitch(found.mp);
      state.activeSku = found.sku;
      renderAllDashboard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderAllDashboard(animate = false) {
  const prod = getActiveProduct();
  renderPresetSkus();
  renderProductOverview(prod, animate);
  renderWarehouses(prod, state.whSort, () => openAlertModal(getActiveProduct(), state));
  renderDynamicChart(prod, state.chartMetric);
  renderWatchlist();
}

/**
 * Validates and fetches (or synthesizes) product telemetry for a WB/Ozon SKU,
 * updates the dashboard, and adds new lookups to the watchlist.
 * @param {string} rawInput
 * @param {"wb"|"ozon"} mp
 */
export function fetchAndDisplaySku(rawInput, mp) {
  if (state.isLoading) return;
  const cleanSku = String(rawInput || "").replace(/\D/g, "");
  if (cleanSku.length < 5) {
    showToast("Введите корректный числовой артикул (от 5 цифр)");
    return;
  }

  state.isLoading = true;
  const track = document.getElementById("fetch-progress-track");
  const bar = document.getElementById("fetch-progress-bar");
  const spinner = document.getElementById("lookup-spinner");
  const btnText = document.getElementById("lookup-btn-text");
  const logEl = document.getElementById("api-fetch-log");

  track?.classList.remove("hidden");
  if (bar) bar.style.width = "28%";
  spinner?.classList.remove("hidden");
  if (btnText) btnText.textContent = "Запрос к API...";

  const endpoint =
    mp === "wb"
      ? `card.wb.ru/cards/v2/detail?nm=${cleanSku}`
      : `api-seller.ozon.ru/v3/product/info/stocks (${cleanSku})`;

  if (logEl) {
    logEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span><span class="truncate">GET ${escapeHtml(endpoint)} ...</span>`;
  }

  setTimeout(() => {
    if (bar) bar.style.width = "76%";
  }, 280);

  setTimeout(() => {
    let found = watchlist.find((w) => w.sku === cleanSku);
    let isNewCustom = false;
    if (!found) {
      found = synthesizeCustomSku(cleanSku, mp);
      watchlist.unshift(found);
      isNewCustom = true;
    }

    state.activeSku = found.sku;
    syncMarketplaceSwitch(found.mp);
    if (bar) bar.style.width = "100%";

    const latency = 140 + (Number(cleanSku.slice(-2)) % 95);
    if (logEl) {
      logEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-ok-600 shrink-0"></span><span class="truncate">GET ${escapeHtml(endpoint)} · 200 OK (${latency} мс)</span>`;
    }

    const syncLabel = document.getElementById("topbar-sync-label");
    if (syncLabel) syncLabel.textContent = `Обновлено в ${getNowTime()} · Арт. ${found.sku}`;

    state.isLoading = false;
    spinner?.classList.add("hidden");
    if (btnText) btnText.textContent = "Проверить артикул →";

    setTimeout(() => {
      track?.classList.add("hidden");
      if (bar) bar.style.width = "0%";
    }, 360);

    renderAllDashboard(true);
    showToast(
      isNewCustom
        ? `Артикул ${found.sku} загружен и добавлен в отслеживание`
        : `Данные карточки ${found.sku} обновлены`
    );
  }, 640);
}

document.querySelectorAll(".mp-switch-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mp = btn.dataset.mpSwitch;
    syncMarketplaceSwitch(mp);
    const firstForMp = watchlist.find((w) => w.mp === mp);
    const input = document.getElementById("sku-input");
    if (firstForMp && input) {
      input.value = firstForMp.sku;
      fetchAndDisplaySku(firstForMp.sku, mp);
    }
  });
});

document.getElementById("sku-lookup-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("sku-input")?.value || "";
  fetchAndDisplaySku(val, state.inputMp);
});

document.querySelectorAll(".wh-sort-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.whSort = btn.dataset.whSort;
    document.querySelectorAll(".wh-sort-btn").forEach((b) => {
      const active = b.dataset.whSort === state.whSort;
      b.className = active
        ? "wh-sort-btn px-2.5 py-1 rounded-lg bg-plumink-900 text-white font-semibold cursor-pointer transition-all"
        : "wh-sort-btn px-2.5 py-1 rounded-lg text-plumink-500 hover:text-plumink-900 cursor-pointer transition-all";
    });
    renderWarehouses(getActiveProduct(), state.whSort, () => openAlertModal(getActiveProduct(), state));
  });
});

document.querySelectorAll(".chart-metric-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.chartMetric = btn.dataset.chartMetric;
    document.querySelectorAll(".chart-metric-btn").forEach((b) => {
      const active = b.dataset.chartMetric === state.chartMetric;
      b.className = active
        ? "chart-metric-btn px-2.5 py-1 rounded-lg bg-plumink-900 text-white font-semibold cursor-pointer transition-all"
        : "chart-metric-btn px-2.5 py-1 rounded-lg text-plumink-500 hover:text-plumink-900 cursor-pointer transition-all";
    });
    renderDynamicChart(getActiveProduct(), state.chartMetric);
  });
});

document.getElementById("open-alert-modal-btn")?.addEventListener("click", () => openAlertModal(getActiveProduct(), state));
document.getElementById("alert-modal-close")?.addEventListener("click", closeAlertModal);
document.getElementById("alert-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "alert-modal") closeAlertModal();
});
document.getElementById("copy-alert-btn")?.addEventListener("click", () => {
  if (state.lastAlertText) copyToClipboard(state.lastAlertText, "Текст Telegram-сводки скопирован");
});

document.getElementById("export-csv-btn")?.addEventListener("click", () => exportWatchlistCsv(watchlist));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAlertModal();
});

syncMarketplaceSwitch("wb");
renderAllDashboard(false);

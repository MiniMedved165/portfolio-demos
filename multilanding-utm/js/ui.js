import { UTM_PRESETS } from "./utm-config.js";
import { FLEET_DATA } from "./fleet-data.js";
import { escapeHtml, sanitizeKeyword, buildQueryForState } from "./utm-engine.js";

const heroKicker = document.getElementById("hero-kicker");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");
const heroBgImg = document.getElementById("hero-bg-img");
const heroCtaBtn = document.getElementById("hero-cta-btn");
const heroRouteInput = document.getElementById("hero-route-input");

const m1Val = document.getElementById("metric-1-val");
const m1Lbl = document.getElementById("metric-1-lbl");
const m2Val = document.getElementById("metric-2-val");
const m2Lbl = document.getElementById("metric-2-lbl");
const m3Val = document.getElementById("metric-3-val");
const m3Lbl = document.getElementById("metric-3-lbl");

const utmUrlPreview = document.getElementById("utm-url-preview");
const utmSourceBadge = document.getElementById("utm-source-badge");
const utmPresetTabs = document.getElementById("utm-preset-tabs");
const fleetGrid = document.getElementById("fleet-grid");

const mainOfferContext = document.getElementById("main-offer-context");
const mainUtmTag = document.getElementById("main-utm-tag");

const leadModal = document.getElementById("lead-demo-modal");
const leadPayloadPre = document.getElementById("lead-payload-pre");
const toast = document.getElementById("site-toast");
const toastText = document.getElementById("site-toast-text");

let toastTimer = null;

/**
 * Displays a temporary notification pill at the top-right corner.
 * @param {string} msg
 */
export function showToast(msg) {
  if (!toast || !toastText) return;
  toastText.textContent = msg;
  toast.classList.remove("opacity-0", "pointer-events-none", "-translate-y-2");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("opacity-0", "pointer-events-none", "-translate-y-2");
  }, 2800);
}

/**
 * Applies UTM preset or custom keyword state across Hero, metrics, fleet highlight, and form context.
 * Uses textContent for all dynamic strings so user-controlled URL parameters cannot inject HTML.
 * @param {object} state
 * @param {string} key
 * @param {string|null} customTerm
 * @param {string|null} customSource
 * @param {boolean} pushUrl
 */
export function applyUtmState(state, key, customTerm = null, customSource = null, pushUrl = true) {
  const base = UTM_PRESETS[key] || UTM_PRESETS.default;
  const safeCustomTerm = customTerm ? sanitizeKeyword(customTerm) : null;
  const safeCustomSource = customSource ? sanitizeKeyword(customSource) : null;

  const active = { ...base };
  if (safeCustomTerm) {
    active.heroKicker = `Запрос из рекламы: «${safeCustomTerm}»`;
    active.heroTitle = `Организуем доставку по запросу «${safeCustomTerm}» под ключ`;
    active.termParam = safeCustomTerm;
    active.sourceLabel = safeCustomSource ? `Канал: ${safeCustomSource}` : "Рекламный переход · Custom UTM";
  } else if (safeCustomSource && key !== "default") {
    active.sourceLabel = `Канал: ${safeCustomSource} · ${base.tabLabel}`;
  }

  state.activePreset = active;

  [heroKicker, heroTitle, heroSubtitle].forEach((el) => el && el.classList.add("swapping"));

  setTimeout(() => {
    if (heroKicker) heroKicker.textContent = active.heroKicker;
    if (heroTitle) heroTitle.textContent = active.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = active.heroSubtitle;
    if (heroCtaBtn) heroCtaBtn.textContent = active.ctaText;
    if (heroRouteInput) heroRouteInput.placeholder = active.routePlaceholder;

    if (m1Val) m1Val.textContent = active.metricOneVal;
    if (m1Lbl) m1Lbl.textContent = active.metricOneLabel;
    if (m2Val) m2Val.textContent = active.metricTwoVal;
    if (m2Lbl) m2Lbl.textContent = active.metricTwoLabel;
    if (m3Val) m3Val.textContent = active.metricThreeVal;
    if (m3Lbl) m3Lbl.textContent = active.metricThreeLabel;

    if (heroBgImg && heroBgImg.getAttribute("src") !== active.heroImg) {
      heroBgImg.style.opacity = "0.55";
      heroBgImg.setAttribute("src", active.heroImg);
      heroBgImg.onload = () => { heroBgImg.style.opacity = "1"; };
    }

    [heroKicker, heroTitle, heroSubtitle].forEach((el) => el && el.classList.remove("swapping"));
  }, 150);

  const query = buildQueryForState(key, safeCustomTerm);
  if (utmUrlPreview) {
    utmUrlPreview.textContent = `https://vektor-logistics.ru/${query}`;
  }
  if (utmSourceBadge) {
    utmSourceBadge.textContent = active.sourceLabel;
  }
  if (mainOfferContext) {
    mainOfferContext.textContent = active.heroTitle;
  }
  if (mainUtmTag) {
    mainUtmTag.textContent = `utm_term=${active.termParam}`;
  }

  if (pushUrl && window.history && window.history.replaceState) {
    const nextUrl = window.location.pathname + query + window.location.hash;
    window.history.replaceState(null, "", nextUrl);
  }

  renderUtmPresets(key, Boolean(safeCustomTerm));
  renderFleet(active.recommendedFleet, (vehicle) => {
    const cargoInput = document.getElementById("main-cargo-input");
    if (cargoInput) {
      cargoInput.value = `${vehicle.name} (${vehicle.capacity})`;
    }
    const calcSection = document.getElementById("calculator");
    if (calcSection) calcSection.scrollIntoView({ behavior: "smooth" });
    showToast(`Выбран транспорт: ${vehicle.name}`);
  });
}

/**
 * Renders interactive UTM preset switch buttons.
 * @param {string} activeKey
 * @param {boolean} hasCustomTerm
 */
export function renderUtmPresets(activeKey, hasCustomTerm = false) {
  if (!utmPresetTabs) return;
  utmPresetTabs.innerHTML = Object.values(UTM_PRESETS).map((preset) => {
    const isActive = preset.key === activeKey && !hasCustomTerm;
    return `
      <button type="button" data-utm-preset="${escapeHtml(preset.key)}"
        class="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isActive
            ? "bg-brand text-white shadow-md shadow-brand/25"
            : "bg-mist-100 hover:bg-mist-200 text-ink-900"
        }">
        ${escapeHtml(preset.tabLabel)}
      </button>
    `;
  }).join("");
}

/**
 * Renders fleet cards and highlights the vehicle recommended for the active UTM offer.
 * @param {string} recommendedId
 * @param {(vehicle: object) => void} onSelectVehicle
 */
export function renderFleet(recommendedId, onSelectVehicle) {
  if (!fleetGrid) return;
  fleetGrid.innerHTML = FLEET_DATA.map((item) => {
    const isRecommended = item.id === recommendedId;
    return `
      <article class="rounded-[24px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
        isRecommended
          ? "bg-white ring-2 ring-brand shadow-xl shadow-brand/10"
          : "bg-white border border-mist-200 hover:border-ink-400"
      }">
        <div>
          <div class="flex items-center justify-between gap-2 mb-5">
            <span class="px-3 py-1 rounded-full text-[11px] font-semibold ${
              isRecommended
                ? "bg-brand text-white"
                : "bg-mist-100 text-ink-700"
            }">
              ${isRecommended ? "★ Под ваш запрос" : escapeHtml(item.badge)}
            </span>
            <span class="font-mono text-xs text-ink-500">${escapeHtml(item.capacity)}</span>
          </div>

          <div class="mb-5 px-2 py-3 rounded-2xl bg-mist-50 border border-mist-100">
            ${item.svg}
          </div>

          <h3 class="text-xl font-bold tracking-[-0.02em] text-ink-900 mb-3">${escapeHtml(item.name)}</h3>

          <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-xs py-3 border-y border-mist-100 mb-5">
            <div>
              <span class="text-ink-400 block">Объём</span>
              <span class="font-mono font-semibold text-ink-900">${escapeHtml(item.volume)}</span>
            </div>
            <div>
              <span class="text-ink-400 block">Вместимость</span>
              <span class="font-mono font-semibold text-ink-900">${escapeHtml(item.pallets)}</span>
            </div>
            <div class="col-span-2 pt-1">
              <span class="text-ink-400 block">Габариты</span>
              <span class="font-mono text-ink-700">${escapeHtml(item.dims)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div>
            <span class="text-[11px] text-ink-400 block">Ставка от</span>
            <span class="font-mono text-base font-bold text-ink-900">${escapeHtml(item.price)}</span>
          </div>
          <button type="button" data-select-fleet="${escapeHtml(item.id)}"
            class="px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isRecommended
                ? "bg-brand hover:bg-brand-hover text-white"
                : "bg-mist-100 hover:bg-ink-900 hover:text-white text-ink-900"
            }">
            Заказать →
          </button>
        </div>
      </article>
    `;
  }).join("");

  fleetGrid.querySelectorAll("[data-select-fleet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-select-fleet");
      const vehicle = FLEET_DATA.find((v) => v.id === id);
      if (vehicle && typeof onSelectVehicle === "function") {
        onSelectVehicle(vehicle);
      }
    });
  });
}

/**
 * Opens the demo webhook payload modal with safely formatted JSON text.
 * @param {object} payload
 */
export function openLeadModal(payload) {
  if (!leadModal || !leadPayloadPre) return;
  leadPayloadPre.textContent = JSON.stringify(payload, null, 2);
  leadModal.classList.add("open");
  leadModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

/**
 * Closes the demo webhook payload modal.
 */
export function closeLeadModal() {
  if (!leadModal) return;
  leadModal.classList.remove("open");
  leadModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

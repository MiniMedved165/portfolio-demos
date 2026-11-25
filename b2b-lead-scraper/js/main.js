import { CITIES, RUBRICS } from "./geo-datasets.js";
import { buildDataset, getFilteredLeads, getNowTime, showToast, copyText } from "./dataset-builder.js";
import { appendRadarLog } from "./radar-ui.js";
import {
  renderLeadsTable,
  closeCompanyDrawer,
  downloadSelectedCsv,
  downloadSelectedJson,
  openCrmExportModal,
  closeCrmExportModal
} from "./table-export.js";

const state = {
  city: "msk",
  rubric: "coffee",
  use2gis: true,
  useYmaps: true,
  dedup: true,
  filters: {
    hasWebsite: false,
    hasMessenger: false,
    highRating: false
  },
  search: "",
  leads: [],
  selectedIds: new Set(),
  duplicatesRemoved: 4,
  isParsing: false,
  activeDrawerLeadId: null,
  lastCrmPayload: ""
};

function runGeoScrape(animate = true) {
  if (state.isParsing) return;

  const citySel = document.getElementById("city-select");
  const rubricSel = document.getElementById("rubric-select");
  state.city = citySel?.value || "msk";
  state.rubric = rubricSel?.value || "coffee";
  state.use2gis = document.getElementById("src-2gis")?.checked ?? true;
  state.useYmaps = document.getElementById("src-ymaps")?.checked ?? true;
  state.dedup = document.getElementById("src-dedup")?.checked ?? true;

  if (!state.use2gis && !state.useYmaps) {
    state.use2gis = true;
    const cb = document.getElementById("src-2gis");
    if (cb) cb.checked = true;
  }

  const cityObj = CITIES[state.city];
  const rubricObj = RUBRICS[state.rubric];
  const radarLogBox = document.getElementById("radar-log-box");

  if (!animate) {
    const built = buildDataset(state.city, state.rubric, state.use2gis, state.useYmaps, state.dedup);
    state.leads = built.leads;
    state.duplicatesRemoved = built.dupCount;
    state.selectedIds = new Set(built.leads.map((l) => l.id));
    if (radarLogBox) radarLogBox.innerHTML = "";
    appendRadarLog("READY", `${cityObj.name} · «${rubricObj.label}» — загружено ${built.leads.length} организаций.`);
    appendRadarLog("DEDUP", `Очищено ${built.dupCount} дублей, проверены телефоны и домены.`);
    renderLeadsTable(state, false);
    return;
  }

  state.isParsing = true;
  const barTrack = document.getElementById("scrape-bar-track");
  const barFill = document.getElementById("scrape-bar-fill");
  const btn = document.getElementById("launch-parse-btn");
  const btnIcon = document.getElementById("parse-btn-icon");
  const btnLabel = document.getElementById("parse-btn-label");
  const beamGroup = document.getElementById("radar-beam-group");

  barTrack?.classList.remove("hidden");
  if (barFill) barFill.style.width = "14%";
  beamGroup?.classList.remove("hidden");
  btnIcon?.classList.add("is-spinning");
  if (btnLabel) btnLabel.textContent = "Сканирование карт...";
  if (btn) btn.disabled = true;

  if (radarLogBox) radarLogBox.innerHTML = "";
  appendRadarLog("QUERY", `Город: ${cityObj.name} · Рубрика: «${rubricObj.label}»`);

  setTimeout(() => {
    if (barFill) barFill.style.width = "44%";
    if (state.use2gis) {
      appendRadarLog("2ГИС", "Собраны карточки организаций, адреса, графики и телефоны (200 OK)", "text-geo-500");
    }
  }, 360);

  setTimeout(() => {
    if (barFill) barFill.style.width = "76%";
    if (state.useYmaps) {
      appendRadarLog("Я.КАРТЫ", "Собраны рейтинги, отзывы, сайты и профили Telegram/WhatsApp", "text-amber-300");
    }
  }, 780);

  setTimeout(() => {
    const built = buildDataset(state.city, state.rubric, state.use2gis, state.useYmaps, state.dedup);
    state.leads = built.leads;
    state.duplicatesRemoved = built.dupCount;
    state.selectedIds = new Set(built.leads.map((l) => l.id));

    if (barFill) barFill.style.width = "100%";
    appendRadarLog(
      "DONE",
      `Готово! Собрано ${built.leads.length} чистых компаний${built.dupCount ? ` (−${built.dupCount} дублей)` : ""}.`,
      "text-emerald-300 font-semibold"
    );

    const statusEl = document.getElementById("topbar-status");
    if (statusEl) statusEl.textContent = `${cityObj.name} · обновлено в ${getNowTime().slice(0, 5)}`;

    state.isParsing = false;
    beamGroup?.classList.add("hidden");
    btnIcon?.classList.remove("is-spinning");
    if (btnLabel) btnLabel.textContent = "Собрать базу компаний";
    if (btn) btn.disabled = false;

    setTimeout(() => {
      barTrack?.classList.add("hidden");
      if (barFill) barFill.style.width = "0%";
    }, 420);

    renderLeadsTable(state, true);
    showToast(`База собрана: ${cityObj.name} — ${built.leads.length} компаний`);
  }, 1220);
}

function syncQualityFilterButtons() {
  document.querySelectorAll(".qfilter-btn").forEach((btn) => {
    const key = btn.dataset.qfilter;
    const active = Boolean(state.filters[key]);
    btn.className = active
      ? "qfilter-btn px-3 py-1.5 rounded-xl border border-geo-600 bg-geo-50 text-xs font-semibold text-geo-700 transition-colors cursor-pointer"
      : "qfilter-btn px-3 py-1.5 rounded-xl border border-mapbg-200 bg-mapbg-50 hover:border-geo-600 text-xs font-medium text-forestink-700 transition-colors cursor-pointer";
  });
  const hasAny =
    state.filters.hasWebsite ||
    state.filters.hasMessenger ||
    state.filters.highRating ||
    state.search.trim().length > 0;
  document.getElementById("qfilter-reset")?.classList.toggle("hidden", !hasAny);
}

function resetAllFilters() {
  state.filters = { hasWebsite: false, hasMessenger: false, highRating: false };
  state.search = "";
  const searchEl = document.getElementById("table-search-input");
  if (searchEl) searchEl.value = "";
  syncQualityFilterButtons();
  renderLeadsTable(state, false);
}

document.getElementById("scraper-query-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  runGeoScrape(true);
});

document.querySelectorAll(".quick-preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cSel = document.getElementById("city-select");
    const rSel = document.getElementById("rubric-select");
    if (cSel) cSel.value = btn.dataset.quickCity;
    if (rSel) rSel.value = btn.dataset.quickRubric;
    runGeoScrape(true);
  });
});

document.querySelectorAll(".qfilter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.qfilter;
    state.filters[key] = !state.filters[key];
    syncQualityFilterButtons();
    renderLeadsTable(state, false);
  });
});

document.getElementById("qfilter-reset")?.addEventListener("click", resetAllFilters);
document.getElementById("empty-reset-btn")?.addEventListener("click", resetAllFilters);

document.getElementById("table-search-input")?.addEventListener("input", (e) => {
  state.search = e.target.value;
  syncQualityFilterButtons();
  renderLeadsTable(state, false);
});

document.getElementById("select-all-cb")?.addEventListener("change", (e) => {
  const filtered = getFilteredLeads(state);
  filtered.forEach((l) => {
    if (e.target.checked) state.selectedIds.add(l.id);
    else state.selectedIds.delete(l.id);
  });
  renderLeadsTable(state, false);
});

document.getElementById("drawer-close-btn")?.addEventListener("click", () => closeCompanyDrawer(state));
document.getElementById("company-drawer")?.addEventListener("click", (e) => {
  if (e.target.id === "company-drawer") closeCompanyDrawer(state);
});

document.getElementById("export-csv-top")?.addEventListener("click", () => downloadSelectedCsv(state));
document.getElementById("export-csv-bottom")?.addEventListener("click", () => downloadSelectedCsv(state));
document.getElementById("export-json-top")?.addEventListener("click", () => downloadSelectedJson(state));
document.getElementById("export-crm-top")?.addEventListener("click", () => openCrmExportModal(state));
document.getElementById("export-crm-bottom")?.addEventListener("click", () => openCrmExportModal(state));
document.getElementById("crm-download-csv-alt")?.addEventListener("click", () => downloadSelectedCsv(state));
document.getElementById("crm-modal-close")?.addEventListener("click", closeCrmExportModal);
document.getElementById("crm-export-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "crm-export-modal") closeCrmExportModal();
});
document.getElementById("copy-crm-batch-btn")?.addEventListener("click", () => {
  if (state.lastCrmPayload) copyText(state.lastCrmPayload, "JSON пакет для CRM скопирован");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCompanyDrawer(state);
    closeCrmExportModal();
  }
});

syncQualityFilterButtons();
runGeoScrape(false);

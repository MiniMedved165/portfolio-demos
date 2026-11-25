import { CITIES, RUBRICS } from "./geo-datasets.js";
import { escapeHtml, getNowTime } from "./dataset-builder.js";

export function appendRadarLog(tag, text, cls = "text-white/80") {
  const radarLogBox = document.getElementById("radar-log-box");
  if (!radarLogBox) return;
  const line = document.createElement("div");
  line.innerHTML = `<span class="text-white/35">[${getNowTime()}]</span> <span class="text-geo-500 font-semibold">${escapeHtml(tag)}</span> <span class="${cls}">${escapeHtml(text)}</span>`;
  radarLogBox.appendChild(line);
  radarLogBox.scrollTop = radarLogBox.scrollHeight;
}

export function renderRadarMap(state, leadsList, onPinClick) {
  const pinsLayer = document.getElementById("radar-pins-layer");
  const cityLabel = document.getElementById("radar-city-label");
  const coordsLabel = document.getElementById("radar-coords-label");
  const city = CITIES[state.city];
  const rubric = RUBRICS[state.rubric];

  if (cityLabel) cityLabel.textContent = `${city.name} · ${rubric.label}`;
  if (coordsLabel) coordsLabel.textContent = city.coords;
  if (!pinsLayer) return;

  pinsLayer.innerHTML = leadsList
    .map((lead, idx) => {
      const both = lead.sources.length === 2;
      const color = both ? "#38BDF8" : lead.sources[0] === "2ГИС" ? "#10B981" : "#FBBF24";
      return `<g class="geo-pin-pop cursor-pointer" style="animation-delay:${idx * 25}ms" data-pin-id="${escapeHtml(lead.id)}">
        <circle cx="${lead.coords.x}" cy="${lead.coords.y}" r="8" fill="${color}" fill-opacity="0.22"/>
        <circle cx="${lead.coords.x}" cy="${lead.coords.y}" r="4.2" fill="${color}" stroke="#0B1210" stroke-width="1.3">
          <title>${escapeHtml(lead.name)} (${escapeHtml(lead.address)})</title>
        </circle>
      </g>`;
    })
    .join("");

  pinsLayer.querySelectorAll("[data-pin-id]").forEach((pin) => {
    pin.addEventListener("click", () => onPinClick(pin.dataset.pinId));
  });
}

export function renderKpis(state, filtered) {
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const total = state.leads.length;
  const withSites = state.leads.filter((l) => Boolean(l.website)).length;
  const withMess = state.leads.filter((l) => l.telegram || l.whatsapp).length;

  setEl("kpi-total", String(total));
  setEl("kpi-dedup-note", state.duplicatesRemoved ? `−${state.duplicatesRemoved} дубля очищено` : "без дедупликации");
  setEl("kpi-phones", String(total));
  setEl("kpi-phones-pct", "100% валидны");
  setEl("kpi-sites", String(withSites));
  setEl("kpi-sites-pct", `${Math.round((withSites / Math.max(1, total)) * 100)}% с сайтом`);
  setEl("kpi-messengers", String(withMess));

  const selectedInFiltered = filtered.filter((l) => state.selectedIds.has(l.id)).length;
  setEl("selection-summary", `Выбрано: ${selectedInFiltered} из ${filtered.length}`);
  setEl("topbar-selected-pill", String(selectedInFiltered));

  const selectAllCb = document.getElementById("select-all-cb");
  if (selectAllCb) {
    selectAllCb.checked = filtered.length > 0 && selectedInFiltered === filtered.length;
  }
}

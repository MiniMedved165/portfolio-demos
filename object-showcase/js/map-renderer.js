import {
  CABINS,
  STATUS_META,
  escapeHtml,
  formatRub,
  getCabinStatus,
  getNightPrice,
  matchesFilters
} from "./cabins-data.js";

const tooltipEl = document.getElementById("map-hover-tooltip");
const mapContainer = document.getElementById("territory-map-view");

function positionTooltip(e) {
  if (!tooltipEl || !mapContainer) return;
  const rect = mapContainer.getBoundingClientRect();
  let left = e.clientX - rect.left + 16;
  let top = e.clientY - rect.top - 14;
  if (left + 210 > rect.width) left = e.clientX - rect.left - 215;
  if (top + 96 > rect.height) top = rect.height - 104;
  tooltipEl.style.left = `${Math.max(10, left)}px`;
  tooltipEl.style.top = `${Math.max(10, top)}px`;
}

/**
 * Renders interactive SVG pins on the territory masterplan with hover tooltips.
 * @param {object} state
 * @param {(cabinId: string) => void} onSelectCabin
 */
export function renderSvgMapPlots(state, onSelectCabin) {
  const layer = document.getElementById("svg-cabins-layer");
  if (!layer) return;

  layer.innerHTML = CABINS.map((cabin) => {
    const status = getCabinStatus(cabin, state.activePeriod);
    const meta = STATUS_META[status];
    const isSelected = cabin.id === state.selectedCabinId;
    const isMatched = matchesFilters(cabin, state);
    const nightPrice = getNightPrice(cabin, state.activePeriod);
    const { x, y } = cabin.coords;

    return `<g class="map-plot ${isSelected ? "is-selected" : ""} ${!isMatched ? "is-dimmed" : ""}" data-cabin-id="${escapeHtml(cabin.id)}" tabindex="0" role="button" aria-label="${escapeHtml(cabin.name)}, ${escapeHtml(meta.label)}, ${escapeHtml(formatRub(nightPrice))} за ночь">
      <circle cx="${x}" cy="${y}" r="36" fill="${meta.color}" fill-opacity="${isSelected ? "0.22" : "0.09"}" stroke="${meta.color}" stroke-opacity="${isSelected ? "0.85" : "0.35"}" stroke-width="${isSelected ? "2" : "1.2"}" stroke-dasharray="${isSelected ? "none" : "4 4"}"/>
      ${isSelected ? `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="#F2ECDC" stroke-width="2" class="selected-beacon"/>` : ""}

      <g class="plot-pin" filter="url(#pinShadow)">
        <circle cx="${x}" cy="${y}" r="22" fill="${isSelected ? "#F2ECDC" : "#123124"}" stroke="${meta.color}" stroke-width="${isSelected ? "3.2" : "2.4"}"/>
        <path d="M${x} ${y - 11} L${x - 9} ${y + 5} H${x + 9} Z" fill="none" stroke="${isSelected ? "#123124" : "#F2ECDC"}" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="${x + 8}" y="${y - 24}" width="26" height="16" rx="8" fill="${meta.color}"/>
        <text x="${x + 21}" y="${y - 13}" text-anchor="middle" fill="#0B2118" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700">${escapeHtml(cabin.number)}</text>
        <rect x="${x - 32}" y="${y + 25}" width="64" height="18" rx="9" fill="${isSelected ? "#F2ECDC" : "#0B2118"}" fill-opacity="${isSelected ? "1" : "0.92"}" stroke="${isSelected ? "#123124" : "rgba(242,236,220,0.22)"}" stroke-width="1"/>
        <text x="${x}" y="${y + 37}" text-anchor="middle" fill="${isSelected ? "#123124" : "#F2ECDC"}" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="600">${Math.round(nightPrice / 100) / 10}k ₽</text>
      </g>
    </g>`;
  }).join("");

  layer.querySelectorAll(".map-plot").forEach((node) => {
    const cid = node.dataset.cabinId;
    const cabin = CABINS.find((c) => c.id === cid);
    if (!cabin) return;

    node.addEventListener("click", () => {
      onSelectCabin(cid);
    });

    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        node.click();
      }
    });

    node.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || !tooltipEl || !mapContainer) return;
      const status = getCabinStatus(cabin, state.activePeriod);
      const meta = STATUS_META[status];
      const nightPrice = getNightPrice(cabin, state.activePeriod);
      tooltipEl.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-bold text-xs text-pine-900">${escapeHtml(cabin.name)}</span>
          <span class="w-2 h-2 rounded-full shrink-0" style="background:${meta.color}"></span>
        </div>
        <div class="text-[11px] text-pine-700">${escapeHtml(cabin.zone)} · до ${cabin.capacity} чел.</div>
        <div class="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-pine-900/10 text-[11px] font-mono">
          <span class="font-bold text-pine-900">${escapeHtml(formatRub(nightPrice))}/ночь</span>
          <span class="font-semibold" style="color:${meta.color}">${escapeHtml(meta.label)}</span>
        </div>`;
      tooltipEl.classList.remove("hidden");
      positionTooltip(e);
    });

    node.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") positionTooltip(e);
    });

    node.addEventListener("pointerleave", () => {
      tooltipEl?.classList.add("hidden");
    });
  });
}

export function renderTableRows(state, onSelectCabin) {
  const rowsEl = document.getElementById("territory-list-rows");
  if (!rowsEl) return;

  const filtered = CABINS.filter((c) => matchesFilters(c, state));
  if (!filtered.length) {
    rowsEl.innerHTML = `<div class="py-12 text-center text-sm text-birch-100/70">По выбранным фильтрам домиков нет. Попробуйте сбросить фильтры выше.</div>`;
    return;
  }

  rowsEl.innerHTML = filtered
    .map((c) => {
      const st = getCabinStatus(c, state.activePeriod);
      const meta = STATUS_META[st];
      const active = c.id === state.selectedCabinId;
      return `<div data-list-cabin="${escapeHtml(c.id)}" class="p-3.5 rounded-2xl border transition-colors flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 cursor-pointer ${
        active ? "bg-pine-800 border-birch-100/50" : "bg-pine-900/70 border-birch-100/12 hover:border-birch-100/35"
      }">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${escapeHtml(c.image)}" alt="" class="w-14 h-12 rounded-xl object-cover shrink-0">
          <div class="min-w-0">
            <div class="font-bold text-sm text-birch-100 truncate">${escapeHtml(c.name)}</div>
            <div class="text-xs text-birch-100/60">${escapeHtml(c.zone)} · ${escapeHtml(c.area)} · до ${c.capacity} чел.</div>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0 ml-auto">
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold" style="color:${meta.color}">
            <span class="w-2 h-2 rounded-full" style="background:${meta.color}"></span>
            ${escapeHtml(meta.label)}
          </span>
          <span class="font-mono text-sm font-bold text-birch-100">${escapeHtml(formatRub(getNightPrice(c, state.activePeriod)))}</span>
        </div>
      </div>`;
    })
    .join("");

  rowsEl.querySelectorAll("[data-list-cabin]").forEach((row) => {
    row.addEventListener("click", () => {
      onSelectCabin(row.dataset.listCabin);
    });
  });
}

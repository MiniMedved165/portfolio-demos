import { DAYS_14 } from "./sku-presets.js";
import { escapeHtml, formatRub } from "./sku-synthesizer.js";

export function renderDynamicChart(prod, metric) {
  const container = document.getElementById("dynamic-svg-chart");
  const titleEl = document.getElementById("chart-card-title");
  const tooltipEl = document.getElementById("chart-tooltip");
  const distEl = document.getElementById("rating-distribution-box");
  if (!container) return;

  const series =
    metric === "rating"
      ? prod.historyRating
      : metric === "price"
        ? prod.historyPrice
        : prod.historyStock;

  const strokeColor =
    metric === "rating"
      ? "#D97706"
      : prod.mp === "wb"
        ? "#8B2CF5"
        : "#005BFF";

  if (titleEl) {
    titleEl.textContent =
      metric === "rating"
        ? "Динамика рейтинга (14 дней)"
        : metric === "price"
          ? "Динамика цены покупателя (14 дней)"
          : "Динамика суммарного остатка (14 дней)";
  }

  const minRaw = Math.min(...series);
  const maxRaw = Math.max(...series);
  const pad = metric === "rating" ? 0.04 : Math.max(10, (maxRaw - minRaw) * 0.16);
  const minV = metric === "rating" ? Math.max(3.5, minRaw - pad) : Math.max(0, minRaw - pad);
  const maxV = metric === "rating" ? Math.min(5.0, maxRaw + pad) : maxRaw + pad;
  const span = Math.max(0.01, maxV - minV);

  const w = 520;
  const h = 188;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 26;

  const mapX = (i) => padL + (i / (series.length - 1)) * (w - padL - padR);
  const mapY = (v) => h - padB - ((v - minV) / span) * (h - padT - padB);

  const pts = series.map((v, i) => ({ x: mapX(i), y: mapY(v), v, day: DAYS_14[i] }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${h - padB} L${pts[0].x.toFixed(1)},${h - padB} Z`;

  const formatYLabel = (v) =>
    metric === "rating"
      ? v.toFixed(2)
      : metric === "price"
        ? `${Math.round(v).toLocaleString("ru-RU")}`
        : `${Math.round(v)}`;

  const midV = (minV + maxV) / 2;

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-auto overflow-visible select-none" role="img" aria-label="График за 14 дней">
      <defs>
        <linearGradient id="mpChartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.24"/>
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
        </linearGradient>
      </defs>

      ${[maxV, midV, minV]
        .map((val) => {
          const y = mapY(val).toFixed(1);
          return `
            <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#E5E2EE" stroke-width="1" stroke-dasharray="3 3"/>
            <text x="${padL - 8}" y="${Number(y) + 3}" text-anchor="end" fill="#9891AB" font-family="JetBrains Mono, monospace" font-size="9">${formatYLabel(val)}</text>`;
        })
        .join("")}

      <path d="${areaPath}" fill="url(#mpChartArea)"/>
      <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>

      ${pts
        .map((p, idx) => {
          const showXLabel = idx === 0 || idx === 4 || idx === 9 || idx === 13;
          return `<g class="chart-hit-col" data-pt-idx="${idx}">
            <rect x="${(p.x - 16).toFixed(1)}" y="${padT}" width="32" height="${h - padT - padB}" fill="transparent"/>
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" fill="${strokeColor}" fill-opacity="0.2" class="chart-dot-ring opacity-0"/>
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${idx === pts.length - 1 ? 4.5 : 3.2}" fill="${strokeColor}" stroke="#FFFFFF" stroke-width="1.6"/>
            ${showXLabel ? `<text x="${p.x.toFixed(1)}" y="${h - 6}" text-anchor="middle" fill="#6B6480" font-family="JetBrains Mono, monospace" font-size="9">${p.day}</text>` : ""}
          </g>`;
        })
        .join("")}
    </svg>
  `;

  const stageWrap = document.getElementById("chart-stage-wrap");
  container.querySelectorAll(".chart-hit-col").forEach((col) => {
    col.addEventListener("pointerenter", () => {
      const idx = Number(col.dataset.ptIdx);
      const val = series[idx];
      const valLabel =
        metric === "rating"
          ? `${val.toFixed(2)} ★`
          : metric === "price"
            ? formatRub(val)
            : `${val.toLocaleString("ru-RU")} шт.`;

      if (!tooltipEl || !stageWrap) return;
      tooltipEl.innerHTML = `
        <div class="text-white/55 text-[10px]">${escapeHtml(DAYS_14[idx])}</div>
        <div class="text-sm font-bold text-white mt-0.5">${escapeHtml(valLabel)}</div>
        <div class="text-[10px] text-emerald-300 mt-0.5">Цена: ${formatRub(prod.historyPrice[idx])} · ★ ${prod.historyRating[idx].toFixed(2)}</div>`;
      tooltipEl.classList.remove("hidden");

      const rect = stageWrap.getBoundingClientRect();
      const leftPct = idx / (series.length - 1);
      const leftPx = leftPct * (rect.width - 170) + 12;
      tooltipEl.style.left = `${Math.max(10, Math.min(rect.width - 165, leftPx))}px`;
      tooltipEl.style.top = "10px";
    });
  });

  stageWrap?.addEventListener("pointerleave", () => {
    tooltipEl?.classList.add("hidden");
  });

  if (distEl) {
    const stars = ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"];
    const colors = ["bg-ok-600", "bg-emerald-400", "bg-amber-400", "bg-orange-400", "bg-crit-600"];
    distEl.innerHTML = `
      <div class="flex items-center justify-between text-[11px] font-mono text-plumink-500">
        <span>Распределение отзывов (${prod.reviewsCount.toLocaleString("ru-RU")} шт.)</span>
        <span class="text-plumink-900 font-semibold">${prod.ratingBreakdown[0]}% — пять звёзд</span>
      </div>
      <div class="grid grid-cols-5 gap-2">
        ${prod.ratingBreakdown
          .map(
            (pct, i) => `
            <div class="p-2 rounded-xl bg-porcelain-50 border border-porcelain-200 flex flex-col gap-1">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-plumink-700 font-semibold">${stars[i]}</span>
                <span class="text-plumink-500">${pct}%</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-porcelain-200 overflow-hidden">
                <div class="h-full rounded-full ${colors[i]}" style="width:${Math.max(3, pct)}%"></div>
              </div>
            </div>`
          )
          .join("")}
      </div>`;
  }
}

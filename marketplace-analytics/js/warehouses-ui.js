import { escapeHtml } from "./sku-synthesizer.js";

export function renderWarehouses(prod, whSort, onOpenAlert) {
  const listEl = document.getElementById("warehouses-list");
  const subEl = document.getElementById("warehouses-subtitle");
  const adviceEl = document.getElementById("restock-advice-bar");
  if (!listEl) return;

  if (subEl) {
    subEl.textContent = `Распределение по 6 региональным складам ${prod.mp === "wb" ? "Wildberries" : "Ozon"}`;
  }

  const enriched = prod.warehouses.map((w) => ({
    ...w,
    days: w.dailySales > 0 ? Math.floor(w.qty / w.dailySales) : 99
  }));

  const maxQty = Math.max(1, ...enriched.map((w) => w.qty));
  const sorted = [...enriched].sort((a, b) =>
    whSort === "risk" ? a.days - b.days : b.qty - a.qty
  );

  listEl.innerHTML = sorted
    .map((w) => {
      const pct = Math.min(100, Math.round((w.qty / maxQty) * 100));
      const isOut = w.qty === 0;
      const isCrit = !isOut && w.days <= 7;
      const isWarn = !isOut && !isCrit && w.days <= 14;

      const barColor = isOut || isCrit
        ? "bg-crit-600"
        : isWarn
          ? "bg-warn-600"
          : prod.mp === "wb"
            ? "bg-wb"
            : "bg-ozon";

      const badgeCls = isOut || isCrit
        ? "bg-crit-50 text-crit-600 border-crit-100"
        : isWarn
          ? "bg-warn-50 text-warn-600 border-warn-100"
          : "bg-ok-50 text-ok-600 border-ok-100";

      const statusText = isOut ? "Обнулён (0 дн.)" : `хватит на ${w.days} дн.`;

      return `<div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-bold text-plumink-900 truncate">${escapeHtml(w.name)}</span>
            <span class="font-mono text-[10.5px] text-plumink-400 shrink-0">${w.dailySales} шт/д</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-mono font-bold text-plumink-900">${w.qty.toLocaleString("ru-RU")} шт</span>
            <span class="px-2 py-0.5 rounded-md border font-mono text-[10px] font-semibold ${badgeCls}">
              ${statusText}
            </span>
          </div>
        </div>
        <div class="w-full h-2 rounded-full bg-porcelain-100 overflow-hidden">
          <div class="h-full rounded-full ${barColor} transition-all duration-500" style="width: ${isOut ? 2 : Math.max(6, pct)}%;"></div>
        </div>
      </div>`;
    })
    .join("");

  const needRestock = enriched.filter((w) => w.days < 14);
  const recommendedBatch = needRestock.reduce((acc, w) => acc + Math.max(0, w.dailySales * 21 - w.qty), 0);

  if (adviceEl) {
    if (needRestock.length) {
      const topRisk = sorted[0];
      adviceEl.innerHTML = `
        <div class="flex items-start gap-2.5">
          <span class="w-2 h-2 rounded-full bg-crit-600 mt-1.5 shrink-0"></span>
          <span class="text-plumink-700 leading-snug">
            <strong class="text-plumink-900">Рекомендация к поставке:</strong> отгрузить <strong>+${recommendedBatch.toLocaleString("ru-RU")} шт.</strong> на ${needRestock.length} склад(а) (приоритет — ${escapeHtml(topRisk.name)}).
          </span>
        </div>
        <button type="button" id="advice-open-alert" class="font-mono text-[11px] font-bold text-wb hover:underline shrink-0 cursor-pointer">
          В Telegram →
        </button>`;
      document.getElementById("advice-open-alert")?.addEventListener("click", onOpenAlert);
    } else {
      adviceEl.innerHTML = `
        <div class="flex items-center gap-2 text-ok-600 font-medium">
          <span>✓</span>
          <span>Все 6 складов обеспечены запасом более чем на 14 дней продаж.</span>
        </div>`;
    }
  }
}

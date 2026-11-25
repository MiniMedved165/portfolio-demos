import {
  safeCsvCell,
  formatRub,
  getNowTime,
  getTotalStock,
  getDaysRemaining,
  showToast
} from "./sku-synthesizer.js";

export function openAlertModal(prod, state) {
  const alertModal = document.getElementById("alert-modal");
  const total = getTotalStock(prod);
  const days = getDaysRemaining(prod);
  const lowWarehouses = prod.warehouses
    .map((w) => ({ ...w, d: w.dailySales > 0 ? Math.floor(w.qty / w.dailySales) : 99 }))
    .filter((w) => w.d < 10);

  const whLines = lowWarehouses.length
    ? lowWarehouses
        .map((w) => `   • ${w.name}: ${w.qty} шт. (${w.qty === 0 ? "ОБНУЛЁН!" : `осталось на ${w.d} дн.`})`)
        .join("\n")
    : "   • Критичных складов нет — запас в норме ✓";

  state.lastAlertText =
    `📊 ПУЛЬС MP · СВОДКА ПО АРТИКУЛУ (${getNowTime()})\n` +
    `Площадка: ${prod.mp === "wb" ? "Wildberries" : "Ozon"} · Арт. ${prod.sku}\n` +
    `Товар: ${prod.name}\n\n` +
    `💳 Цена с ${prod.mp === "wb" ? "СПП" : "Ozon Картой"}: ${formatRub(prod.buyerPrice)} (прод. ${formatRub(prod.sellerPrice)}, −${prod.sppPercent}%)\n` +
    `📦 Общий остаток: ${total} шт. (~${days} дн. при ${prod.ordersPerDay} шт/д)\n` +
    `⭐ Рейтинг: ${prod.rating.toFixed(2)} (${prod.ratingDelta >= 0 ? "+" : ""}${prod.ratingDelta.toFixed(2)} за 14 дн., ${prod.reviewsCount} отз.)\n\n` +
    `⚠️ Склады под контролем (< 10 дн.):\n${whLines}`;

  const pre = document.getElementById("alert-preview-pre");
  const tm = document.getElementById("alert-modal-time");
  if (pre) pre.textContent = state.lastAlertText;
  if (tm) tm.textContent = getNowTime();

  alertModal?.classList.add("is-open");
  alertModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeAlertModal() {
  const alertModal = document.getElementById("alert-modal");
  alertModal?.classList.remove("is-open");
  alertModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function exportWatchlistCsv(watchlist) {
  const headers = [
    "Площадка",
    "Артикул",
    "Бренд",
    "Товар",
    "Цена покупателя (RUB)",
    "Цена продавца (RUB)",
    "Скидка МП (%)",
    "Остаток всего (шт)",
    "Заказов в день",
    "Хватит дней",
    "Рейтинг",
    "Отзывов"
  ];
  const rows = [headers.join(";")];

  watchlist.forEach((p) => {
    rows.push(
      [
        safeCsvCell(p.mp === "wb" ? "Wildberries" : "Ozon"),
        safeCsvCell(p.sku),
        safeCsvCell(p.brand),
        safeCsvCell(p.name),
        safeCsvCell(p.buyerPrice),
        safeCsvCell(p.sellerPrice),
        safeCsvCell(p.sppPercent),
        safeCsvCell(getTotalStock(p)),
        safeCsvCell(p.ordersPerDay),
        safeCsvCell(getDaysRemaining(p)),
        safeCsvCell(p.rating.toFixed(2)),
        safeCsvCell(p.reviewsCount)
      ].join(";")
    );
  });

  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mp-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Отчёт по ${watchlist.length} артикулам скачан в CSV`);
}

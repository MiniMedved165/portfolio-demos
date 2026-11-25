/**
 * Escapes HTML special characters to prevent XSS in dynamic markup.
 * @param {unknown} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Guards CSV cells against Excel Formula Injection (=, +, -, @) and wraps in quotes safely.
 * @param {unknown} value
 * @returns {string}
 */
export function safeCsvCell(value) {
  let str = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@]/.test(str)) str = `'${str}`;
  return `"${str.replace(/"/g, '""')}"`;
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

export function getNowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function getTotalStock(prod) {
  return prod.warehouses.reduce((acc, w) => acc + w.qty, 0);
}

export function getDaysRemaining(prod) {
  const total = getTotalStock(prod);
  return prod.ordersPerDay > 0 ? Math.floor(total / prod.ordersPerDay) : 99;
}

let toastTimer = null;

export function showToast(msg) {
  const toastEl = document.getElementById("mp-toast");
  const toastText = document.getElementById("mp-toast-text");
  if (!toastEl || !toastText) return;
  toastText.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2400);
}

export function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => showToast(message),
      () => showToast("Скопируйте значение вручную")
    );
    return;
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(message);
  } catch {
    showToast("Скопируйте значение вручную");
  }
}

/**
 * Generates a deterministic synthetic product telemetry profile for any arbitrary numeric SKU.
 * @param {string} rawSku
 * @param {"wb"|"ozon"} mp
 * @returns {object}
 */
export function synthesizeCustomSku(rawSku, mp) {
  const cleanSku = String(rawSku).replace(/\D/g, "").slice(0, 12) || "245801932";
  const seed = cleanSku.split("").reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 3), 0);

  const names = [
    "Увлажняющий тоник с пантенолом и экстрактом центеллы, 200 мл",
    "Маска для волос с кератином и аргановым маслом, 300 мл",
    "SPF 50+ солнцезащитный флюид для лица невидимый, 50 мл",
    "Гидрофильное масло для снятия макияжа с миндалём, 150 мл"
  ];
  const sellerPrice = 1190 + (seed % 14) * 150;
  const spp = mp === "wb" ? 18 + (seed % 8) : 9 + (seed % 6);
  const buyerPrice = Math.round((sellerPrice * (1 - spp / 100)) / 10) * 10;
  const basePrice = Math.round((sellerPrice * 1.55) / 10) * 10;
  const ordersPerDay = 15 + (seed % 32);
  const rating = Number((4.68 + (seed % 26) / 100).toFixed(2));
  const ratingDelta = Number((((seed % 15) - 4) / 100).toFixed(2));

  const whNames =
    mp === "wb"
      ? ["Коледино (Москва)", "Электросталь", "Казань", "Краснодар", "Екатеринбург", "СПБ Уткина Заводь"]
      : ["Хоругвино (МО)", "Тверь РФЦ", "СПБ Шушары", "Казань РФЦ", "Екатеринбург РФЦ", "Ростов-на-Дону"];

  const warehouses = whNames.map((wName, i) => {
    const factor = [0.38, 0.24, 0.14, 0.11, 0.08, 0.05][i];
    const daily = Math.max(1, Math.round(ordersPerDay * factor));
    const qty = i === 5 && seed % 2 === 0 ? 0 : Math.round(daily * (5 + ((seed + i * 7) % 24)));
    return { name: wName, qty, dailySales: daily };
  });

  const totalNow = warehouses.reduce((s, w) => s + w.qty, 0);
  const historyRating = Array.from({ length: 14 }, (_, i) =>
    Number(Math.min(5, Math.max(4.1, rating - ratingDelta + (ratingDelta * i) / 13)).toFixed(2))
  );
  const historyPrice = Array.from({ length: 14 }, (_, i) =>
    Math.round((buyerPrice * (1 + (13 - i) * 0.004 * (seed % 2 === 0 ? 1 : -0.6))) / 10) * 10
  );
  const historyStock = Array.from({ length: 14 }, (_, i) =>
    Math.max(0, totalNow + (13 - i) * ordersPerDay)
  );

  return {
    sku: cleanSku,
    mp,
    brand: "LUMIÈRE LAB",
    category: "Уходовая косметика · Запрос по SKU",
    name: names[seed % names.length],
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80",
    sellerPrice,
    buyerPrice,
    basePrice,
    sppPercent: spp,
    rating,
    ratingDelta,
    reviewsCount: 240 + (seed % 1100),
    ordersPerDay,
    ratingBreakdown: [85, 8, 4, 2, 1],
    warehouses,
    historyRating,
    historyPrice,
    historyStock
  };
}

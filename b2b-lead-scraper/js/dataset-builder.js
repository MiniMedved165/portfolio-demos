import { CITIES, RUBRICS } from "./geo-datasets.js";

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
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function getNowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

let toastTimer = null;

export function showToast(msg) {
  const toastEl = document.getElementById("geo-toast");
  const toastText = document.getElementById("geo-toast-text");
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

export function copyText(text, msg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => showToast(msg),
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
    showToast(msg);
  } catch {
    showToast("Скопируйте значение вручную");
  }
}

/**
 * Builds a synthetic deduplicated B2B lead list for the selected City, Rubric, and Sources.
 * Uses strictly template phone numbers (+7 999 000-XX-XX) and example.ru domains.
 * @param {string} cityKey
 * @param {string} rubricKey
 * @param {boolean} use2gis
 * @param {boolean} useYmaps
 * @param {boolean} dedup
 * @returns {{ leads: Array<object>, dupCount: number }}
 */
export function buildDataset(cityKey, rubricKey, use2gis, useYmaps, dedup) {
  const city = CITIES[cityKey] || CITIES.msk;
  const rubric = RUBRICS[rubricKey] || RUBRICS.coffee;

  const baseLeads = rubric.companies.map((c, idx) => {
    const district = city.districts[idx % city.districts.length];
    const street = city.streets[idx % city.streets.length];
    const house = 4 + ((idx * 7 + 3) % 42);
    const phoneTail1 = String(10 + idx * 3).padStart(2, "0");
    const phoneTail2 = String(20 + idx * 5).padStart(2, "0");

    let sources = [];
    if (use2gis && useYmaps) {
      sources = idx % 3 === 0 ? ["2ГИС", "Я.Карты"] : idx % 3 === 1 ? ["2ГИС"] : ["Я.Карты"];
    } else if (use2gis) {
      sources = ["2ГИС"];
    } else if (useYmaps) {
      sources = ["Я.Карты"];
    } else {
      sources = ["2ГИС"];
    }

    const angle = (idx / rubric.companies.length) * Math.PI * 2 + 0.3;
    const radiusX = 52 + ((idx * 37) % 105);
    const radiusY = 30 + ((idx * 29) % 62);
    const mapX = Math.max(28, Math.min(372, Math.round(200 + Math.cos(angle) * radiusX)));
    const mapY = Math.max(24, Math.min(196, Math.round(110 + Math.sin(angle) * radiusY)));

    return {
      id: `${cityKey}-${rubricKey}-${idx + 1}`,
      name: c.name,
      rubricShort: rubric.short,
      cityName: city.name,
      district,
      address: `${street}, д. ${house}`,
      phone: `+7 (999) 000-${phoneTail1}-${phoneTail2}`,
      website: c.domain,
      email: c.email,
      rating: c.rating,
      reviews: c.reviews,
      telegram: c.tg,
      whatsapp: c.wa,
      hours: rubric.hours,
      sources,
      coords: { x: mapX, y: mapY }
    };
  });

  const dupCount = use2gis && useYmaps && dedup ? 4 : dedup ? 2 : 0;
  return { leads: baseLeads, dupCount };
}

export function getFilteredLeads(state) {
  const q = state.search.trim().toLowerCase();
  return state.leads.filter((lead) => {
    if (state.filters.hasWebsite && !lead.website) return false;
    if (state.filters.hasMessenger && !lead.telegram && !lead.whatsapp) return false;
    if (state.filters.highRating && lead.rating < 4.5) return false;
    if (q) {
      const hay = `${lead.name} ${lead.address} ${lead.district} ${lead.website || ""} ${lead.phone}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

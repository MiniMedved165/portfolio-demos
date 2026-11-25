import { CATEGORIES, RGB_THEMES } from "./catalog-data.js";

/**
 * Escapes HTML special characters to prevent XSS in template strings.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

export function getSelectedPart(buildState, catId) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat) return null;
  return cat.items.find((item) => item.id === buildState[catId]) || cat.items[0];
}

export function getRgbTheme(buildState) {
  return RGB_THEMES.find((t) => t.id === buildState.rgb) || RGB_THEMES[0];
}

/**
 * Computes total price, TDP load, PSU compatibility, and estimated FPS for a build config.
 * @param {object} cfg
 * @returns {{ parts: object, total: number, tdp: number, psuWatts: number, loadPct: number, psuOk: boolean, cpFps: number, csFps: number }}
 */
export function evaluateBuild(cfg) {
  let total = 0;
  let tdp = 65;
  const parts = {};

  CATEGORIES.forEach((cat) => {
    const found = cat.items.find((i) => i.id === cfg[cat.id]) || cat.items[0];
    parts[cat.id] = found;
    total += found.price;
    tdp += found.tdp || 0;
  });

  const psuWatts = parts.psu.watts || 850;
  const loadPct = Math.round((tdp / psuWatts) * 100);
  const psuOk = psuWatts >= tdp + 120;

  const cpFps = Math.round(parts.gpu.fpsBase * (parts.cpu.fpsMult || 1) + (parts.ram.fpsBonus || 0));
  const csFps = Math.round(parts.gpu.csBase + (parts.cpu.csBonus || 0) + (parts.ram.fpsBonus || 0) * 3);

  return { parts, total, tdp, psuWatts, loadPct, psuOk, cpFps, csFps };
}

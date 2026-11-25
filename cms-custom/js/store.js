import { DEFAULT_CMS_DATA, PRESET_IMAGES, STORAGE_KEY } from "./default-data.js";

/**
 * Экранирует спецсимволы HTML для безопасной вставки пользовательских строк.
 *
 * @param {unknown} str Исходное значение.
 * @returns {string} Экранированная строка.
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
 * Проверяет URL изображения: допускает только https:// или безопасный относительный путь.
 *
 * @param {unknown} url Ссылка на изображение.
 * @returns {string} Безопасный URL или пресет по умолчанию.
 */
export function sanitizeImageUrl(url) {
  const str = String(url ?? "").trim();
  if (/^https:\/\//i.test(str) || /^(\/|\.\/|\.\.\/)/.test(str)) {
    return str;
  }
  return PRESET_IMAGES[0].url;
}

/**
 * Ограничивает числовое значение цены в диапазоне 0..999999.
 *
 * @param {unknown} value Значение цены.
 * @returns {number} Корректное целое или неотрицательное число.
 */
export function clampPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(999999, Math.max(0, Math.round(num)));
}

export function formatRub(val) {
  return `${clampPrice(val).toLocaleString("ru-RU")} ₽`;
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_CMS_DATA));
}

function sanitizeMenuItem(item, index) {
  if (!item || typeof item !== "object") return null;
  return {
    id: String(item.id || `item-${index + 1}`),
    category: String(item.category || "bakery"),
    title: String(item.title || "Позиция").slice(0, 140),
    desc: String(item.desc || "").slice(0, 400),
    weight: String(item.weight || "").slice(0, 40),
    price: clampPrice(item.price),
    oldPrice: clampPrice(item.oldPrice),
    badge: String(item.badge || "").slice(0, 40),
    visible: Boolean(item.visible),
    image: sanitizeImageUrl(item.image)
  };
}

/**
 * Загружает и валидирует состояние CMS из localStorage с откатом к DEFAULT_CMS_DATA.
 *
 * @returns {Object} Валидный объект данных CMS.
 */
export function loadCmsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.texts || !Array.isArray(parsed.menu)) {
      return cloneDefault();
    }

    const base = cloneDefault();
    const safeMenu = parsed.menu.map(sanitizeMenuItem).filter(Boolean);
    const safeTexts = { ...base.texts };
    Object.keys(base.texts).forEach((key) => {
      if (parsed.texts[key] !== undefined) {
        safeTexts[key] =
          key === "featuredPrice"
            ? clampPrice(parsed.texts[key])
            : String(parsed.texts[key]).slice(0, 500);
      }
    });

    return {
      ...base,
      texts: safeTexts,
      menu: safeMenu.length ? safeMenu : base.menu
    };
  } catch {
    return cloneDefault();
  }
}

export const store = {
  data: loadCmsData(),
  activeCategory: "all",
  activeCmsTab: "menu",
  isLoggedIn: false,
  isAddingItem: false,
  expandedCmsItemId: null,
  featuredQty: 1,
  cart: [],
  listeners: []
};

store.expandedCmsItemId = store.data.menu[0]?.id || null;

export function subscribe(listener) {
  store.listeners.push(listener);
}

/**
 * Сохраняет текущее состояние в localStorage и уведомляет подписчиков интерфейса.
 *
 * @param {string|null} flashTargetId ID DOM-элемента для подсветки изменения.
 */
export function persistCmsData(flashTargetId = null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.data));
  } catch {
    // Игнорируем ограничения квоты хранилища в песочницах
  }
  store.listeners.forEach((fn) => fn(flashTargetId));
}

export function resetCmsToDefaults() {
  store.data = cloneDefault();
  store.activeCategory = "all";
  store.expandedCmsItemId = store.data.menu[0]?.id || null;
  store.isAddingItem = false;
  persistCmsData(null);
}

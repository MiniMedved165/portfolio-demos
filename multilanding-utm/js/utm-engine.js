import { UTM_PRESETS } from "./utm-config.js";

const MAX_CUSTOM_KEYWORD_LENGTH = 46;

/**
 * Escapes HTML special characters to prevent XSS in template strings.
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Strips control characters and caps length of a custom UTM term.
 * @param {string} rawValue
 * @returns {string}
 */
export function sanitizeKeyword(rawValue) {
  const cleaned = String(rawValue ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, MAX_CUSTOM_KEYWORD_LENGTH);
}

/**
 * Resolves a preset configuration from URLSearchParams (`utm_term`, `utm_campaign`).
 * @param {URLSearchParams} params
 * @returns {{ preset: object, customTerm: string|null, customSource: string|null }}
 */
export function resolvePresetFromParams(params) {
  const rawTerm = sanitizeKeyword(params.get("utm_term") || "");
  const rawCampaign = sanitizeKeyword(params.get("utm_campaign") || "");
  const rawSource = sanitizeKeyword(params.get("utm_source") || "");
  const combined = `${rawTerm} ${rawCampaign}`.toLowerCase();

  let matchedKey = "default";
  if (UTM_PRESETS[rawTerm]) {
    matchedKey = rawTerm;
  } else if (combined.includes("fura") || combined.includes("20t") || combined.includes("mezhgorod") || combined.includes("фур")) {
    matchedKey = "fura20";
  } else if (combined.includes("gazel") || combined.includes("city") || combined.includes("gorod") || combined.includes("газел")) {
    matchedKey = "gazel";
  } else if (combined.includes("ref") || combined.includes("thermo") || combined.includes("rezhim") || combined.includes("рефриж")) {
    matchedKey = "ref";
  } else if (combined.includes("negabarit") || combined.includes("tral") || combined.includes("heavy") || combined.includes("трал") || combined.includes("негабар")) {
    matchedKey = "negabarit";
  }

  return {
    preset: UTM_PRESETS[matchedKey] || UTM_PRESETS.default,
    customTerm: matchedKey === "default" && rawTerm ? rawTerm : null,
    customSource: rawSource || null
  };
}

/**
 * Builds clean query parameters for a given preset or custom keyword.
 * @param {string} key
 * @param {string|null} customTerm
 * @returns {string}
 */
export function buildQueryForState(key, customTerm = null) {
  if (customTerm) {
    const params = new URLSearchParams({
      utm_source: "yandex",
      utm_medium: "cpc",
      utm_campaign: "custom_keyword",
      utm_term: sanitizeKeyword(customTerm)
    });
    return `?${params.toString()}`;
  }
  const preset = UTM_PRESETS[key] || UTM_PRESETS.default;
  return preset.utmQuery || "";
}

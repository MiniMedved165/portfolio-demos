import { UTM_PRESETS } from "./utm-config.js";
import { resolvePresetFromParams, sanitizeKeyword } from "./utm-engine.js";
import { applyUtmState, showToast, openLeadModal, closeLeadModal } from "./ui.js";

const state = {
  activePreset: UTM_PRESETS.default
};

const utmPresetTabs = document.getElementById("utm-preset-tabs");
const utmCustomInput = document.getElementById("utm-custom-input");
const utmCustomApply = document.getElementById("utm-custom-apply");
const heroQuickForm = document.getElementById("hero-quick-form");
const mainDispatchForm = document.getElementById("main-dispatch-form");
const leadModal = document.getElementById("lead-demo-modal");
const leadPayloadPre = document.getElementById("lead-payload-pre");
const headerEl = document.getElementById("site-header");

function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("ring-2", "ring-red-500");
  inputEl.focus();
  showToast(message);
  setTimeout(() => {
    inputEl.classList.remove("ring-2", "ring-red-500");
  }, 2200);
}

function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/* ==================== PRESET & KEYWORD HANDLERS ==================== */
if (utmPresetTabs) {
  utmPresetTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-utm-preset]");
    if (!btn) return;
    const key = btn.getAttribute("data-utm-preset");
    applyUtmState(state, key, null, null, true);
    showToast(`Оффер переключён: ${UTM_PRESETS[key].tabLabel}`);
  });
}

function handleCustomKeyword() {
  const safeVal = sanitizeKeyword(utmCustomInput ? utmCustomInput.value : "");
  if (!safeVal) {
    showToast("Введите ключевую фразу, например «рефрижератор»");
    return;
  }
  const syntheticParams = new URLSearchParams({ utm_term: safeVal, utm_source: "yandex" });
  const resolved = resolvePresetFromParams(syntheticParams);
  applyUtmState(state, resolved.preset.key, resolved.customTerm, "yandex", true);
  showToast(`Подмена под ключ: «${safeVal}»`);
}

if (utmCustomApply) {
  utmCustomApply.addEventListener("click", handleCustomKeyword);
}
if (utmCustomInput) {
  utmCustomInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomKeyword();
    }
  });
}

/* ==================== FORMS & VALIDATION ==================== */
if (heroQuickForm) {
  heroQuickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const routeInput = document.getElementById("hero-route-input");
    const phoneInput = document.getElementById("hero-phone-input");
    const route = routeInput ? routeInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!isValidPhone(phone)) {
      markFieldInvalid(phoneInput, "Укажите корректный номер телефона (от 10 цифр)");
      return;
    }

    openLeadModal({
      event: "lead_created",
      form_id: "hero_quick_dock",
      contact: {
        route: route || "Москва — Санкт-Петербург",
        phone
      },
      utm: {
        utm_source: state.activePreset.sourceChannel.split(" / ")[0],
        utm_medium: state.activePreset.sourceChannel.split(" / ")[1] || "direct",
        utm_campaign: state.activePreset.campaignParam,
        utm_term: state.activePreset.termParam
      },
      matched_offer: state.activePreset.heroTitle,
      recommended_vehicle: state.activePreset.recommendedFleet
    });
  });
}

if (mainDispatchForm) {
  mainDispatchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("main-name-input");
    const phoneInput = document.getElementById("main-phone-input");
    const routeInput = document.getElementById("main-route-input");
    const cargoInput = document.getElementById("main-cargo-input");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const route = routeInput ? routeInput.value.trim() : "";
    const cargo = cargoInput ? cargoInput.value.trim() : "";

    if (name.length < 2) {
      markFieldInvalid(nameInput, "Укажите имя или компанию (минимум 2 символа)");
      return;
    }
    if (!isValidPhone(phone)) {
      markFieldInvalid(phoneInput, "Укажите корректный номер телефона (от 10 цифр)");
      return;
    }

    openLeadModal({
      event: "lead_created",
      form_id: "main_dispatch_calculator",
      contact: {
        client: name,
        phone,
        route: route || "Не указан",
        cargo: cargo || "Не указан"
      },
      utm: {
        utm_source: state.activePreset.sourceChannel.split(" / ")[0],
        utm_medium: state.activePreset.sourceChannel.split(" / ")[1] || "direct",
        utm_campaign: state.activePreset.campaignParam,
        utm_term: state.activePreset.termParam
      },
      matched_offer: state.activePreset.heroTitle
    });
  });
}

/* ==================== MODAL & HEADER CONTROLS ==================== */
const modalCloseBtn = document.getElementById("lead-modal-close");
const modalOkBtn = document.getElementById("lead-modal-ok");
const copyJsonBtn = document.getElementById("lead-copy-json");

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeLeadModal);
if (modalOkBtn) modalOkBtn.addEventListener("click", closeLeadModal);
if (leadModal) {
  leadModal.addEventListener("click", (e) => {
    if (e.target === leadModal) closeLeadModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && leadModal && leadModal.classList.contains("open")) {
    closeLeadModal();
  }
});

if (copyJsonBtn) {
  copyJsonBtn.addEventListener("click", () => {
    if (!leadPayloadPre) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(leadPayloadPre.textContent || "").then(() => {
        showToast("JSON-пейлоад скопирован");
      }).catch(() => {
        showToast("Не удалось скопировать JSON");
      });
    } else {
      showToast("Буфер обмена недоступен");
    }
  });
}

window.addEventListener("scroll", () => {
  if (!headerEl) return;
  if (window.scrollY > 40) {
    headerEl.classList.add("shadow-sm");
  } else {
    headerEl.classList.remove("shadow-sm");
  }
}, { passive: true });

/* ==================== SCROLL REVEAL & BOOT ==================== */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

const initialParams = new URLSearchParams(window.location.search);
const initialResolved = resolvePresetFromParams(initialParams);
applyUtmState(
  state,
  initialResolved.preset.key,
  initialResolved.customTerm,
  initialResolved.customSource,
  false
);

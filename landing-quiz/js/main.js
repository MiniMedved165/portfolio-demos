import { QUIZ_CONFIG } from "./config.js";
import { calculateEstimate } from "./calculator.js";
import { initQuizUI, quizState, renderQuizStep } from "./quiz-ui.js";

const resultModal = document.getElementById("demo-result-modal");
const resultModalClose = document.getElementById("demo-modal-close");
const resultModalRestart = document.getElementById("demo-modal-restart");
const payloadPreview = document.getElementById("demo-payload-preview");
const copyJsonBtn = document.getElementById("copy-json-btn");

let lastJsonString = "";
let copyResetTimer = null;

function buildLeadPayload(currentState) {
  const calc = calculateEstimate(currentState);
  const timelineObj = QUIZ_CONFIG.timelines.find((t) => t.id === currentState.timeline);
  const selectedOptionTitles = currentState.options.map((id) => {
    const opt = QUIZ_CONFIG.extraOptions.find((o) => o.id === id);
    return opt ? opt.title : id;
  });

  return {
    source: "MONOLITH Quiz Demo (/landing-quiz/)",
    client: {
      name: currentState.leadName,
      contact: currentState.leadPhone,
      preferred_channel: currentState.channel
    },
    quiz_answers: {
      object_type: calc.prop.title,
      area_sqm: currentState.area,
      ceiling: calc.ceil.label,
      style: calc.styleObj.title,
      extra_options: selectedOptionTitles.length ? selectedOptionTitles : ["Только базовые работы"],
      start_timeline: timelineObj ? timelineObj.label : "",
      selected_bonus: calc.bonusObj.title
    },
    estimate: {
      rough_works_rub: calc.roughCost,
      finish_works_rub: calc.finishCost,
      options_rub: calc.optionsCost,
      discount_percent: calc.discountPercent,
      saving_rub: calc.saving,
      final_total_rub: calc.finalTotal,
      estimated_months: calc.durationMonths
    }
  };
}

function openDemoResultModal(payload) {
  if (!resultModal) return;
  lastJsonString = JSON.stringify(payload, null, 2);
  if (payloadPreview) {
    payloadPreview.textContent = lastJsonString;
  }
  resultModal.classList.add("is-open");
  resultModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDemoResultModal() {
  if (!resultModal) return;
  resultModal.classList.remove("is-open");
  resultModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function copyPayloadToClipboard() {
  if (!lastJsonString || !copyJsonBtn) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(lastJsonString);
    } else {
      const tempInput = document.createElement("textarea");
      tempInput.value = lastJsonString;
      tempInput.setAttribute("readonly", "");
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }

    copyJsonBtn.textContent = "Скопировано ✓";
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      copyJsonBtn.textContent = "Скопировать JSON-пример";
    }, 2000);
  } catch {
    copyJsonBtn.textContent = "Не удалось скопировать";
  }
}

function initModal() {
  resultModalClose?.addEventListener("click", closeDemoResultModal);
  resultModal?.addEventListener("click", (e) => {
    if (e.target === resultModal) closeDemoResultModal();
  });
  resultModalRestart?.addEventListener("click", () => {
    closeDemoResultModal();
    quizState.step = 1;
    renderQuizStep();
  });
  copyJsonBtn?.addEventListener("click", copyPayloadToClipboard);
}

function initNavigation() {
  const headerEl = document.getElementById("site-header");
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const mobilePanel = document.getElementById("mobile-nav-panel");

  window.addEventListener(
    "scroll",
    () => {
      headerEl?.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );

  function toggleMobileNav(force) {
    const nextState = typeof force === "boolean" ? force : !mobilePanel?.classList.contains("is-open");
    mobilePanel?.classList.toggle("is-open", nextState);
    mobileToggle?.setAttribute("aria-expanded", String(nextState));
  }

  mobileToggle?.addEventListener("click", () => toggleMobileNav());
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => toggleMobileNav(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDemoResultModal();
      toggleMobileNav(false);
    }
  });
}

function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || prefersReducedMotion) return;

  document.documentElement.classList.add("js-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal-el").forEach((el) => observer.observe(el));
}

function bootstrap() {
  initNavigation();
  initModal();
  initScrollReveal();
  initQuizUI((currentState) => {
    const payload = buildLeadPayload(currentState);
    openDemoResultModal(payload);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

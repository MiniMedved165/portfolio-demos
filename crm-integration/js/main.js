import {
  closeCrmModal,
  initCrmModal,
  openCrmModal,
  showToast
} from "./crm-modal.js";
import {
  initSpeechSynthesis,
  renderDiagnostic,
  renderIdiomCard,
  renderLevelSpread,
  renderSlots
} from "./school-ui.js";

const state = {
  idiomIdx: 0,
  activeCefr: "A1",
  diagStep: 0,
  diagScore: 0,
  diagResultLevel: null,
  selectedSlot: "Завтра, 18:00"
};

function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("ring-2", "ring-vermilion");
  inputEl.focus();
  showToast(message);
  setTimeout(() => {
    inputEl.classList.remove("ring-2", "ring-vermilion");
  }, 2200);
}

function isValidContact(contact) {
  const trimmed = String(contact || "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 || /^@[a-zA-Z0-9_]{4,32}$/.test(trimmed);
}

document.querySelectorAll(".pick-program-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const prog = btn.dataset.pickProgram;
    const select = document.getElementById("enroll-program");
    if (select && prog) select.value = prog;
    document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("enroll-name")?.focus({ preventScroll: true }), 420);
  });
});

document.getElementById("enrollment-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("enroll-name");
  const phoneInput = document.getElementById("enroll-phone");
  const emailInput = document.getElementById("enroll-email");
  const progSelect = document.getElementById("enroll-program");

  const name = (nameInput?.value || "").trim();
  const phone = (phoneInput?.value || "").trim();
  const email = (emailInput?.value || "").trim();

  if (name.length < 2) {
    markFieldInvalid(nameInput, "Укажите ваше имя (минимум 2 символа)");
    return;
  }
  if (!isValidContact(phone)) {
    markFieldInvalid(phoneInput, "Укажите телефон (от 10 цифр) или @telegram");
    return;
  }

  const selectedOption = progSelect?.options[progSelect.selectedIndex];
  const budget = Number(selectedOption?.dataset.budget || 14900);

  const leadData = {
    name,
    phone,
    email,
    program: progSelect?.value || "Подростки и экзамены (A2–B2)",
    budget,
    level: document.getElementById("enroll-level")?.value || "A1 · Начальный",
    format: document.getElementById("enroll-format")?.value || "Онлайн на платформе SAYSO",
    slot: state.selectedSlot,
    comment: document.getElementById("enroll-comment")?.value.trim() || "",
    testResult: state.diagResultLevel ? `${state.diagScore}/3 (${state.diagResultLevel.split(" ")[0]})` : null
  };

  openCrmModal(leadData);
});

const headerEl = document.getElementById("site-header");
window.addEventListener(
  "scroll",
  () => headerEl?.classList.toggle("is-scrolled", window.scrollY > 16),
  { passive: true }
);

const mobileBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
mobileBtn?.addEventListener("click", () => {
  const next = mobileBtn.getAttribute("aria-expanded") !== "true";
  mobileMenu?.classList.toggle("is-open", next);
  mobileBtn.setAttribute("aria-expanded", String(next));
});
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("is-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCrmModal();
    mobileMenu?.classList.remove("is-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
  }
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  document.documentElement.classList.add("js-motion");
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

initSpeechSynthesis(state);
initCrmModal();
renderIdiomCard(state);
renderLevelSpread(state, false);
renderDiagnostic(state);
renderSlots(state);

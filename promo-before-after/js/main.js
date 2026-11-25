import { SITE_CONFIG } from "./config.js";
import { buildBookingPayload, calculateBookingEstimate, formatPhoneInput } from "./booking-logic.js";
import { createComparisonSlider } from "./slider.js";
import {
  applyScenario,
  closeDemoModal,
  dom,
  openDemoModal,
  renderBookingControls,
  renderScenarioTabs,
  renderServicesGrid,
  showToast,
  switchModalTab,
  updateBookingSummary
} from "./ui.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  activeScenarioIndex: 0,
  sliderPercent: 50,
  isDragging: false,
  scrollLinked: !prefersReducedMotion,
  autoDemoRaf: null,
  scrollRafPending: false,
  booking: {
    carClassId: "sedan",
    serviceId: "ceramic",
    timeSlot: SITE_CONFIG.timeSlots[1]
  },
  lastPayload: null
};

const slider = createComparisonSlider({ dom, state, showToast });

async function copyJsonSafely() {
  if (!state.lastPayload) return;
  const text = JSON.stringify(state.lastPayload, null, 2);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast("JSON скопирован в буфер обмена");
  } catch {
    showToast("Скопируйте JSON вручную из окна");
  }
}

function initAppEvents() {
  dom.bookCurrentScenarioBtn.addEventListener("click", () => {
    const sc = SITE_CONFIG.scenarios[state.activeScenarioIndex];
    state.booking.serviceId = sc.serviceId;
    renderBookingControls(state);
    updateBookingSummary(state);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    showToast(`В запись добавлено: ${sc.tabLabel}`);
  });

  dom.bookingPhone.addEventListener("input", (e) => {
    e.target.value = formatPhoneInput(e.target.value);
  });

  dom.quickBookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = dom.bookingName.value.trim();
    const phoneDigits = dom.bookingPhone.value.replace(/\D/g, "");

    if (name.length < 2) {
      dom.bookingError.textContent = "Пожалуйста, укажите имя (минимум 2 символа).";
      dom.bookingError.classList.remove("hidden");
      dom.bookingName.focus();
      return;
    }
    if (phoneDigits.length < 11) {
      dom.bookingError.textContent = "Введите телефон в формате +7 (999) 000-00-00 (для теста можно вымышленный).";
      dom.bookingError.classList.remove("hidden");
      dom.bookingPhone.focus();
      return;
    }

    dom.bookingError.classList.add("hidden");
    const est = calculateBookingEstimate(state.booking);
    const payload = buildBookingPayload(state.booking, est, {
      name,
      phone: dom.bookingPhone.value,
      carModel: dom.bookingCarModel.value
    });
    state.lastPayload = payload;
    openDemoModal(payload);
  });

  dom.closeModalBtn.addEventListener("click", closeDemoModal);
  dom.modalDoneBtn.addEventListener("click", closeDemoModal);
  dom.demoModal.addEventListener("click", (e) => {
    if (e.target === dom.demoModal) closeDemoModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dom.demoModal.classList.contains("hidden")) {
      closeDemoModal();
    }
  });

  dom.tabCrmBtn.addEventListener("click", () => switchModalTab("crm"));
  dom.tabJsonBtn.addEventListener("click", () => switchModalTab("json"));
  dom.copyJsonBtn.addEventListener("click", copyJsonSafely);

  dom.mobileMenuBtn.addEventListener("click", () => {
    const isHidden = dom.mobileMenu.classList.toggle("hidden");
    dom.mobileMenuBtn.setAttribute("aria-expanded", String(!isHidden));
  });
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      dom.mobileMenu.classList.add("hidden");
      dom.mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
  }
}

function bootstrap() {
  renderScenarioTabs(state, slider);
  applyScenario(0);
  slider.updateScrollSyncUI();
  if (state.scrollLinked) {
    slider.syncCurtainWithScroll();
  } else {
    slider.setCurtainPosition(50);
  }
  renderServicesGrid(state);
  renderBookingControls(state);
  updateBookingSummary(state);
  slider.init();
  initAppEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

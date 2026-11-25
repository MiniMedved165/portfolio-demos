import {
  dom,
  showToast,
  updateLiveEstimatePanel,
  renderQuizStep,
  renderCases,
  renderFaq,
  closeDemoModal,
  switchModalTab
} from "./ui.js";

const state = {
  currentStep: 1,
  debtAmount: 850000,
  debtTypes: ["credits"],
  propertyType: "sole_home",
  overdueStatus: "over_3m",
  hadTransactions: false,
  paymentPlan: "installment_10",
  urgency: "standard",
  visitedSteps: new Set([1]),
  lastPayload: null
};

async function copyJsonSafely() {
  if (!state.lastPayload) return;
  const text = JSON.stringify(state.lastPayload, null, 2);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      tempInput.setAttribute("readonly", "");
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }
    showToast("JSON скопирован в буфер обмена");
  } catch {
    showToast("Не удалось скопировать автоматически — выделите текст вручную");
  }
}

function initEvents() {
  dom.prevStepBtn.addEventListener("click", () => {
    if (state.currentStep > 1) {
      state.currentStep -= 1;
      renderQuizStep(state);
      updateLiveEstimatePanel(state);
    }
  });

  dom.nextStepBtn.addEventListener("click", () => {
    if (state.currentStep < 6) {
      state.currentStep += 1;
      if (state.currentStep <= 5) {
        state.visitedSteps.add(state.currentStep);
      }
      renderQuizStep(state);
      updateLiveEstimatePanel(state);
    }
  });

  dom.resetQuizBtn.addEventListener("click", () => {
    state.currentStep = 1;
    state.debtAmount = 850000;
    state.debtTypes = ["credits"];
    state.propertyType = "sole_home";
    state.overdueStatus = "over_3m";
    state.hadTransactions = false;
    state.paymentPlan = "installment_10";
    state.urgency = "standard";
    state.visitedSteps = new Set([1]);
    renderQuizStep(state);
    updateLiveEstimatePanel(state);
    showToast("Параметры квиза сброшены");
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

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
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
    revealEls.forEach((el) => observer.observe(el));
  }
}

function bootstrap() {
  renderCases(state);
  renderFaq();
  renderQuizStep(state);
  updateLiveEstimatePanel(state);
  initEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

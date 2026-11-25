import { CATEGORIES, READY_BUILDS } from "./catalog-data.js";
import { evaluateBuild } from "./build-engine.js";
import { renderPcVisualizer } from "./pc-visualizer.js";
import { initHeroStudioStage } from "./hero-stage.js";
import {
  bindPresetTriggers,
  closeOrderModal,
  initOrderModal,
  openOrderModal,
  renderActiveOptions,
  renderCategoryTabs,
  renderEstimatePanel,
  renderReadyBuilds,
  renderRgbSwatches,
  showToast
} from "./configurator-ui.js";

const DEFAULT_CONFIG = { ...READY_BUILDS[1].config };

const state = {
  build: { ...DEFAULT_CONFIG },
  activeCategoryId: "case"
};

function renderAllConfigurator() {
  const evalData = evaluateBuild(state.build);
  renderCategoryTabs(state, renderAllConfigurator);
  renderActiveOptions(state, renderAllConfigurator);
  renderRgbSwatches(state, renderAllConfigurator);
  renderPcVisualizer(evalData, state.build);
  renderEstimatePanel(evalData, state, renderAllConfigurator);
}

function loadPreset(preset) {
  state.build = { ...preset.config };
  renderAllConfigurator();
  document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth" });
  showToast(`Загружена сборка «${preset.name}» — можно менять детали`);
}

document.querySelectorAll("[data-jump-cat]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.activeCategoryId = btn.dataset.jumpCat;
    renderAllConfigurator();
    document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("cat-prev-btn")?.addEventListener("click", () => {
  const idx = CATEGORIES.findIndex((c) => c.id === state.activeCategoryId);
  if (idx > 0) {
    state.activeCategoryId = CATEGORIES[idx - 1].id;
    renderAllConfigurator();
  }
});

document.getElementById("cat-next-btn")?.addEventListener("click", () => {
  const idx = CATEGORIES.findIndex((c) => c.id === state.activeCategoryId);
  if (idx < CATEGORIES.length - 1) {
    state.activeCategoryId = CATEGORIES[idx + 1].id;
    renderAllConfigurator();
  } else {
    openOrderModal(state);
  }
});

document.getElementById("config-reset-btn")?.addEventListener("click", () => {
  state.build = { ...DEFAULT_CONFIG };
  state.activeCategoryId = "case";
  renderAllConfigurator();
  showToast("Сборка сброшена к базовой конфигурации");
});

const siteHeader = document.getElementById("site-header");
window.addEventListener(
  "scroll",
  () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 20),
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
    closeOrderModal();
    mobileMenu?.classList.remove("is-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
  }
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  document.documentElement.classList.add("js-animate");
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

initOrderModal(state);
bindPresetTriggers(document, loadPreset);
renderReadyBuilds(loadPreset);
renderAllConfigurator();
initHeroStudioStage();

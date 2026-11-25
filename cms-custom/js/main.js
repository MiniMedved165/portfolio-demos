import { store, subscribe } from "./store.js";
import {
  flashElement,
  initCartControls,
  renderStorefrontMenu,
  renderStorefrontTexts,
  updateCartUI
} from "./storefront-ui.js";
import { bindOpenCmsButtons, closeLoginModal, initCmsPanel, openCmsFlow } from "./cms-panel.js";

function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || prefersReducedMotion) return;

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
  document.querySelectorAll(".reveal-block").forEach((el) => observer.observe(el));
}

function renderStorefront() {
  renderStorefrontTexts();
  renderStorefrontMenu({
    onBindCmsButtons: bindOpenCmsButtons,
    onQuickEdit: (itemId) => {
      store.expandedCmsItemId = itemId;
      openCmsFlow("menu");
    }
  });
  updateCartUI();
}

function bootstrap() {
  subscribe((flashTargetId) => {
    renderStorefront();
    flashElement(flashTargetId);
  });

  initCmsPanel();
  const { closeCartModal } = initCartControls();
  bindOpenCmsButtons(document);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLoginModal();
      closeCartModal();
    }
  });

  initScrollReveal();
  renderStorefront();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

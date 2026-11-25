import { SPEAKERS_PAGES, TICKET_TIERS } from "./event-data.js";
import { escapeHtml, formatRub } from "./pricing-engine.js";
import { initHeroRibbonsEngine } from "./hero-ribbons.js";
import {
  bindCheckoutTriggers,
  closeCheckoutModal,
  copyToClipboard,
  initCheckoutModal
} from "./checkout-modal.js";

const checkoutState = {
  tierId: "pro",
  qty: 1,
  addonWorkshop: false,
  promoCode: null,
  payMethod: "card"
};

let speakerPage = 0;

function renderTicketCards() {
  const grid = document.getElementById("ticket-cards-grid");
  if (!grid) return;

  grid.innerHTML = TICKET_TIERS.map((tier) => {
    return `<article data-open-checkout="${escapeHtml(tier.id)}" class="open-checkout-trigger ticket-card ${tier.elevated ? "ticket-card-elevated" : ""} rounded-[24px] p-5 flex flex-col justify-between gap-4 cursor-pointer group">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="w-9 h-9 rounded-full bg-obsidian-950 text-white flex items-center justify-center shrink-0">
            ${tier.iconSvg}
          </span>
          <span class="px-2.5 py-0.5 rounded-full ${tier.elevated ? "bg-flame text-white" : "bg-alabaster-200 text-obsidian-600"} font-mono text-[10px] font-semibold uppercase tracking-wider">
            ${escapeHtml(tier.badge)}
          </span>
        </div>

        <div>
          <h3 class="text-lg sm:text-xl font-extrabold text-obsidian-900 tracking-tight leading-snug">${escapeHtml(tier.name)}</h3>
          <p class="text-xs text-obsidian-600 leading-relaxed mt-1">${escapeHtml(tier.subtitle)}</p>
        </div>

        <div class="flex items-center justify-between gap-2 pt-1">
          <span class="font-mono text-xl font-bold text-obsidian-900">${escapeHtml(formatRub(tier.price))}</span>
          <span class="w-8 h-8 rounded-full bg-obsidian-950 group-hover:bg-flame text-white flex items-center justify-center text-xs transition-colors shrink-0">→</span>
        </div>
      </div>

      ${tier.visualHtml}
    </article>`;
  }).join("");

  bindCheckoutTriggers(grid, checkoutState);
}

function renderSpeakers() {
  const grid = document.getElementById("speakers-grid");
  const counter = document.getElementById("speakers-counter");
  if (!grid) return;

  const list = SPEAKERS_PAGES[speakerPage] || SPEAKERS_PAGES[0];
  if (counter) counter.textContent = `0${speakerPage + 1} / 0${SPEAKERS_PAGES.length}`;

  grid.innerHTML = list
    .map(
      (sp, i) => `
      <article class="speaker-card group relative aspect-[4/4.6] rounded-[22px] overflow-hidden bg-obsidian-950 border border-obsidian-900/12">
        <img src="${escapeHtml(sp.image)}" alt="${escapeHtml(sp.name)}" class="w-full h-full object-cover object-top grayscale contrast-125 transition-transform duration-700 group-hover:scale-105" onerror="this.src='https://placehold.co/600x680/111111/FF4D00?text=${encodeURIComponent(sp.name)}'">
        <div class="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none" style="background: radial-gradient(circle at ${i === 0 ? "50% 22%" : i === 1 ? "78% 34%" : "24% 32%"}, rgba(255,77,0,0.6) 0%, transparent 52%);"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent pointer-events-none"></div>

        <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[10.5px] font-mono text-flame-glow truncate">${escapeHtml(sp.role)}</div>
            <h3 class="text-base font-bold text-white leading-snug mt-0.5">${escapeHtml(sp.name)}</h3>
            <p class="text-[11px] text-white/80 line-clamp-2 mt-0.5 leading-snug">${escapeHtml(sp.topic)}</p>
          </div>
          <button type="button" data-open-checkout="pro" aria-label="Купить билет на доклад ${escapeHtml(sp.name)}" class="open-checkout-trigger w-8 h-8 rounded-full border border-white/35 bg-obsidian-950/50 backdrop-blur-sm group-hover:bg-flame group-hover:border-flame text-white flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer">
            ↗
          </button>
        </div>
      </article>`
    )
    .join("");

  bindCheckoutTriggers(grid, checkoutState);
}

document.getElementById("speakers-prev")?.addEventListener("click", () => {
  speakerPage = (speakerPage - 1 + SPEAKERS_PAGES.length) % SPEAKERS_PAGES.length;
  renderSpeakers();
});

document.getElementById("speakers-next")?.addEventListener("click", () => {
  speakerPage = (speakerPage + 1) % SPEAKERS_PAGES.length;
  renderSpeakers();
});

document.querySelectorAll(".promo-copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const code = btn.dataset.copyPromo || "EARLY20";
    const promoInput = document.getElementById("promo-code-input");
    if (promoInput) promoInput.value = code;
    copyToClipboard(code, `Промокод ${code} скопирован и подставлен`);
  });
});

document.getElementById("open-program-reel-btn")?.addEventListener("click", () => {
  document.getElementById("program")?.scrollIntoView({ behavior: "smooth" });
});

const siteHeader = document.getElementById("site-header");
window.addEventListener(
  "scroll",
  () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18),
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
    closeCheckoutModal();
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

initCheckoutModal(checkoutState);
bindCheckoutTriggers(document, checkoutState);
renderTicketCards();
renderSpeakers();
initHeroRibbonsEngine();

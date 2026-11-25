import { TARIFFS } from "./club-data.js";
import {
  createPaywallState,
  escapeHtml,
  formatRub,
  copyToClipboard
} from "./paywall-state.js";
import { createPaywallController } from "./telegram-ui.js";

const state = createPaywallState();
const controller = createPaywallController(state);

function renderTariffCards() {
  const grid = document.getElementById("tariffs-grid");
  if (!grid) return;

  grid.innerHTML = TARIFFS.map((t) => {
    const isHot = t.highlight;
    return `<article class="rounded-[24px] p-6 sm:p-8 flex flex-col justify-between gap-7 border transition-all duration-300 hover:-translate-y-1 ${
      isHot
        ? "bg-slateink-900 text-paper-50 border-slateink-900 shadow-[0_28px_60px_-26px_rgba(17,23,27,0.45)]"
        : "bg-paper-50 text-slateink-900 border-slateink-900/12"
    }">
      <div>
        <div class="flex items-center justify-between gap-2 mb-4">
          <span class="px-3 py-1 rounded-full font-mono text-[10.5px] font-semibold uppercase tracking-wider ${
            isHot ? "bg-oxblood text-white" : "bg-paper-200 text-slateink-600"
          }">${escapeHtml(t.badge)}</span>
          <span class="font-mono text-xs ${isHot ? "text-paper-200/60" : "text-slateink-400"}">${t.days} дней</span>
        </div>

        <h3 class="font-serif font-bold text-3xl leading-none mb-2">${escapeHtml(t.name)}</h3>
        <div class="flex items-baseline gap-2.5 pb-5 mb-5 border-b ${isHot ? "border-white/12" : "border-slateink-900/10"}">
          <span class="font-mono text-3xl font-bold">${formatRub(t.price)}</span>
          <span class="font-mono text-xs ${isHot ? "text-paper-200/60" : "text-slateink-400"}">${escapeHtml(t.perMonth)}</span>
        </div>

        <ul class="flex flex-col gap-3 text-xs sm:text-sm ${isHot ? "text-paper-100/85" : "text-slateink-600"}">
          ${t.features
            .map(
              (f) =>
                `<li class="flex items-start gap-2.5"><span class="${isHot ? "text-[#F2A6B0]" : "text-oxblood"} font-bold">◆</span><span>${escapeHtml(f)}</span></li>`
            )
            .join("")}
        </ul>
      </div>

      <button type="button" data-launch-tariff="${t.id}" class="launch-tariff-btn w-full py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-[0.12em] cursor-pointer ${
        isHot ? "btn-oxblood" : "btn-outline-ink"
      }">
        Оформить в боте →
      </button>
    </article>`;
  }).join("");

  grid.querySelectorAll(".launch-tariff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tid = btn.dataset.launchTariff;
      document.getElementById("paywall-studio")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => controller.openPaySheet(tid), 320);
    });
  });
}

document.getElementById("phone-tab-bot")?.addEventListener("click", () => controller.switchPhoneTab("bot"));
document.getElementById("phone-tab-channel")?.addEventListener("click", () => controller.switchPhoneTab("channel"));
document.getElementById("back-to-bot-btn")?.addEventListener("click", () => controller.switchPhoneTab("bot"));
document.getElementById("lock-overlay-cta")?.addEventListener("click", () => {
  controller.switchPhoneTab("bot");
  if (state.status === "none" || state.status === "expired") {
    controller.botThink(240, () => controller.showTariffsInBot());
  }
});

document.getElementById("tg-restart-btn")?.addEventListener("click", () => controller.startFreshSession());
document.getElementById("quick-reset-sim")?.addEventListener("click", () => controller.startFreshSession());
document.getElementById("tg-cmd-tariffs")?.addEventListener("click", () => controller.handleBotAction("show_tariffs"));
document.getElementById("tg-cmd-status")?.addEventListener("click", () => controller.handleBotAction("show_status"));
document.getElementById("tg-cmd-channel")?.addEventListener("click", () => controller.switchPhoneTab("channel"));

document.getElementById("pay-sheet-close")?.addEventListener("click", () => controller.closePaySheet());
document.getElementById("pay-sheet-confirm-btn")?.addEventListener("click", () => controller.completeTestPayment());

document.querySelectorAll(".inphone-method-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.inPhonePayMethod = btn.dataset.inphoneMethod;
    document.querySelectorAll(".inphone-method-btn").forEach((b) => {
      const active = b.dataset.inphoneMethod === state.inPhonePayMethod;
      b.className = active
        ? "inphone-method-btn p-2.5 rounded-xl border border-tg-blue bg-tg-blue/15 text-left cursor-pointer"
        : "inphone-method-btn p-2.5 rounded-xl border border-white/12 bg-white/[0.04] text-left cursor-pointer";
    });
  });
});

document.getElementById("test-leak-btn")?.addEventListener("click", () => {
  controller.switchPhoneTab("bot");
  controller.activateInviteLink(true);
});

document.getElementById("warp-warn-btn")?.addEventListener("click", () => controller.simulateExpiryWarning());
document.getElementById("warp-kick-btn")?.addEventListener("click", () => controller.simulateAutoRemoval());

document.querySelectorAll(".console-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.consoleTab;
    document.querySelectorAll(".console-tab-btn").forEach((b) => {
      const active = b.dataset.consoleTab === tab;
      b.className = active
        ? "console-tab-btn px-3 py-1.5 rounded-full bg-paper-100 text-slateink-950 font-semibold cursor-pointer transition-all"
        : "console-tab-btn px-3 py-1.5 rounded-full text-paper-200/70 hover:text-white cursor-pointer transition-all";
    });
    document.getElementById("console-view-access")?.classList.toggle("hidden", tab !== "access");
    document.getElementById("console-view-api")?.classList.toggle("hidden", tab !== "api");
    document.getElementById("console-view-api")?.classList.toggle("flex", tab === "api");
  });
});

document.getElementById("copy-api-log-btn")?.addEventListener("click", () => {
  const text = document.getElementById("bot-api-pre")?.textContent || "";
  if (text) copyToClipboard(text, "Лог Paywall Bot API скопирован");
});

const siteHeader = document.getElementById("site-header");
window.addEventListener(
  "scroll",
  () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 16),
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

renderTariffCards();
controller.startFreshSession();

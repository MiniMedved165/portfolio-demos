import { SERVICES, BARBERS, INITIAL_SCHEDULE_BOOKINGS } from "./salon-data.js";
import {
  escapeHtml,
  formatRub,
  showToast,
  copyToClipboard,
  createTelegramUI
} from "./telegram-ui.js";
import { createSchedulePanel } from "./schedule-panel.js";
import { createBotEngine } from "./bot-engine.js";

const scheduleBookings = INITIAL_SCHEDULE_BOOKINGS.map((item) => ({ ...item }));

const botSession = {
  step: "welcome",
  serviceId: null,
  barberId: null,
  dateId: null,
  time: null,
  clientName: "Алексей",
  clientPhone: "+7 (999) 000-00-00",
  activeBookingId: null,
  tgDarkTheme: true,
  isBotTyping: false
};

const panel = createSchedulePanel(scheduleBookings, botSession);
let engine = null;

const ui = createTelegramUI(botSession, (action, value) => {
  engine?.handleBotCallback(action, value);
});

engine = createBotEngine({
  session: botSession,
  scheduleBookings,
  ui,
  panel
});

function renderServicesSection() {
  const grid = document.getElementById("services-menu-grid");
  if (!grid) return;

  grid.innerHTML = SERVICES.map((s) => {
    return `<article class="py-5 sm:py-6 border-b border-charcoal-900/12 flex items-start justify-between gap-4 group">
      <div class="flex flex-col gap-1.5 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-base sm:text-lg font-bold text-charcoal-900 group-hover:text-cognac transition-colors">${escapeHtml(s.title)}</h3>
          ${s.badge ? `<span class="px-2 py-0.5 rounded-full bg-cognac-soft text-cognac font-mono text-[10px] font-semibold uppercase">${escapeHtml(s.badge)}</span>` : ""}
        </div>
        <p class="text-xs sm:text-[13px] text-charcoal-600 leading-relaxed max-w-md">${escapeHtml(s.desc)}</p>
        <span class="font-mono text-[11px] text-charcoal-400">Длительность: ${escapeHtml(s.duration)}</span>
      </div>

      <div class="flex flex-col items-end gap-2 shrink-0">
        <span class="font-mono text-base sm:text-lg font-bold text-charcoal-900">${formatRub(s.price)}</span>
        <button type="button" data-launch-service="${s.id}" class="launch-service-btn px-3.5 py-1.5 rounded-full border border-charcoal-900/20 group-hover:bg-charcoal-900 group-hover:text-linen-50 text-[11px] font-semibold transition-colors cursor-pointer">
          Записаться →
        </button>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll(".launch-service-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const srv = SERVICES.find((s) => s.id === btn.dataset.launchService);
      if (!srv) return;
      document.getElementById("bot-studio")?.scrollIntoView({ behavior: "smooth" });
      botSession.serviceId = srv.id;
      ui.removeOldInlineKeyboards();
      ui.setReplyKeyboard([]);
      ui.appendUserMessage(`Выбрана услуга с сайта: ${srv.title}`);
      ui.botReplyWithTyping(350, () => engine.promptBarberStep());
      showToast(`Услуга «${srv.shortTitle}» передана в бота`);
    });
  });
}

function renderBarbersSection() {
  const grid = document.getElementById("barbers-cards-grid");
  if (!grid) return;

  grid.innerHTML = BARBERS.map((b) => {
    return `<article class="group rounded-[24px] bg-linen-50 border border-charcoal-900/10 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(22,22,20,0.2)]">
      <div>
        <div class="relative aspect-[4/4.2] bg-charcoal-900 overflow-hidden">
          <img src="${escapeHtml(b.photo)}" alt="${escapeHtml(b.name)}" class="w-full h-full object-cover object-top grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" onerror="this.src='https://placehold.co/600x640/161614/F2EFE9?text=${encodeURIComponent(b.shortName)}'">
          <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-linen-50/95 text-charcoal-900 font-mono text-[11px] font-bold shadow">★ ${escapeHtml(b.rating)}</span>
          <span class="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full bg-charcoal-950/80 backdrop-blur-sm text-linen-50 font-mono text-[10.5px]">Ближайшее: ${escapeHtml(b.nextSlot)}</span>
        </div>
        <div class="p-5 sm:p-6">
          <div class="font-mono text-[11px] uppercase tracking-wider text-cognac font-semibold mb-1">${escapeHtml(b.role)}</div>
          <h3 class="text-xl font-bold text-charcoal-900 mb-2">${escapeHtml(b.name)}</h3>
          <p class="text-xs sm:text-[13px] text-charcoal-600 leading-relaxed">${escapeHtml(b.specialty)}</p>
        </div>
      </div>
      <div class="px-5 sm:px-6 pb-5 pt-3 border-t border-charcoal-900/10">
        <button type="button" data-launch-barber="${b.id}" class="launch-barber-btn btn-outline-charcoal w-full py-3 rounded-full text-xs font-semibold cursor-pointer">
          Записаться к ${escapeHtml(b.shortName)} в боте →
        </button>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll(".launch-barber-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const barber = BARBERS.find((b) => b.id === btn.dataset.launchBarber);
      if (!barber) return;
      document.getElementById("bot-studio")?.scrollIntoView({ behavior: "smooth" });
      botSession.serviceId = botSession.serviceId || "combo";
      botSession.barberId = barber.id;
      ui.removeOldInlineKeyboards();
      ui.setReplyKeyboard([]);
      ui.appendUserMessage(`Записаться к мастеру: ${barber.name}`);
      ui.botReplyWithTyping(350, () => engine.promptDateStep(false));
      showToast(`Открыто расписание мастера ${barber.shortName}`);
    });
  });
}

document.getElementById("tg-composer-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (botSession.isBotTyping) return;
  const input = document.getElementById("tg-message-input");
  const val = input?.value.trim() || "";
  if (!val) return;
  input.value = "";

  ui.appendUserMessage(val);

  if (val.toLowerCase() === "/start") {
    engine.startBotWelcome();
    return;
  }

  if (botSession.step === "contact") {
    ui.removeOldInlineKeyboards();
    ui.setReplyKeyboard([]);
    engine.finalizeBooking(val.slice(0, 32), "+7 (999) 000-00-00");
    return;
  }

  panel.recordBotEvent("message.text", { text: val, fsm_state: botSession.step });
  ui.botReplyWithTyping(380, () => {
    ui.appendBotMessage({
      htmlText: `Принял сообщение! Чтобы быстро записаться или управлять визитом, используйте кнопки ниже:`,
      buttons: [
        [{ label: "✂️ Записаться на стрижку", action: "choose_service", echoText: "Записаться на стрижку" }],
        [{ label: "📅 Мои записи", action: "my_bookings", echoText: "Мои записи" }]
      ]
    });
  });
});

const tgThemeBtn = document.getElementById("tg-theme-toggle");
const tgHeader = document.getElementById("tg-header");
const tgComposer = document.getElementById("tg-composer-form");
const tgInput = document.getElementById("tg-message-input");

tgThemeBtn?.addEventListener("click", () => {
  botSession.tgDarkTheme = !botSession.tgDarkTheme;
  const dark = botSession.tgDarkTheme;
  tgThemeBtn.textContent = dark ? "☀" : "☾";

  ui.chatScrollEl?.classList.toggle("tg-wallpaper-dark", dark);
  ui.chatScrollEl?.classList.toggle("tg-wallpaper-light", !dark);

  if (tgHeader) {
    tgHeader.className = dark
      ? "bg-tg-header text-white px-4 pt-3 pb-3 border-b border-white/8 flex items-center justify-between gap-2 shrink-0"
      : "bg-white text-charcoal-900 px-4 pt-3 pb-3 border-b border-black/10 flex items-center justify-between gap-2 shrink-0";
  }
  if (tgComposer) {
    tgComposer.className = dark
      ? "bg-tg-header px-3 py-2.5 border-t border-white/8 flex items-center gap-2 shrink-0"
      : "bg-white px-3 py-2.5 border-t border-black/10 flex items-center gap-2 shrink-0";
  }
  if (tgInput) {
    tgInput.className = dark
      ? "flex-1 min-w-0 bg-transparent border-0 text-base sm:text-xs text-white placeholder-white/40 focus:ring-0 px-1.5 py-1.5"
      : "flex-1 min-w-0 bg-transparent border-0 text-base sm:text-xs text-charcoal-900 placeholder-charcoal-400 focus:ring-0 px-1.5 py-1.5";
  }
  engine.startBotWelcome();
});

document.getElementById("tg-restart-btn")?.addEventListener("click", () => engine.startBotWelcome());
document.getElementById("tg-menu-cmd-btn")?.addEventListener("click", () => engine.startBotWelcome());
document.getElementById("quick-restart-link")?.addEventListener("click", () => engine.startBotWelcome());
document.getElementById("trigger-reminder-btn")?.addEventListener("click", () => engine.triggerTwoHourReminder());

document.querySelectorAll(".side-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.sideTab;
    document.querySelectorAll(".side-tab-btn").forEach((b) => {
      const active = b.dataset.sideTab === tab;
      b.className = active
        ? "side-tab-btn px-3 py-1.5 rounded-full bg-linen-100 text-charcoal-950 font-semibold cursor-pointer transition-all"
        : "side-tab-btn px-3 py-1.5 rounded-full text-linen-200/70 hover:text-white cursor-pointer transition-all";
    });
    document.getElementById("side-view-schedule")?.classList.toggle("hidden", tab !== "schedule");
    document.getElementById("side-view-api")?.classList.toggle("hidden", tab !== "api");
    document.getElementById("side-view-api")?.classList.toggle("flex", tab === "api");
  });
});

document.getElementById("copy-bot-log-btn")?.addEventListener("click", () => {
  const text = document.getElementById("bot-api-pre")?.textContent || "";
  if (text) copyToClipboard(text, "Лог Telegram Bot API скопирован");
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

renderServicesSection();
renderBarbersSection();
panel.renderLiveSchedule();
engine.startBotWelcome();

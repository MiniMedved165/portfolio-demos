import { escapeHtml, formatRub, getNowTimeStr, subtractTwoHours } from "./telegram-ui.js";

const STATUS_MAP = {
  scheduled: { label: "Записан · ждёт напоминания", cls: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
  reminded: { label: "Напоминание (2ч) отправлено", cls: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  confirmed: { label: "✓ Визит подтверждён", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  cancelled: { label: "✕ Отменено · слот свободен", cls: "bg-rose-500/15 text-rose-300 border-rose-400/30" }
};

export function createSchedulePanel(scheduleBookings, session) {
  const botApiLog = [];

  function recordBotEvent(eventType, payload) {
    botApiLog.unshift({
      timestamp: new Date().toISOString(),
      event: eventType,
      ...payload
    });
    if (botApiLog.length > 10) botApiLog.pop();
    const preEl = document.getElementById("bot-api-pre");
    if (preEl) {
      preEl.textContent = JSON.stringify(botApiLog.slice(0, 4), null, 2);
    }
  }

  function updateStepPills(activeKey) {
    const order = ["service", "barber", "slot", "reminder"];
    const activeIdx = order.indexOf(activeKey);
    document.querySelectorAll(".step-pill").forEach((pill) => {
      const idx = order.indexOf(pill.dataset.stepPill);
      if (idx === activeIdx) {
        pill.className = "step-pill px-3 py-2.5 rounded-xl bg-charcoal-900 text-linen-50 border border-charcoal-900 transition-all shadow-sm";
      } else if (idx < activeIdx) {
        pill.className = "step-pill px-3 py-2.5 rounded-xl bg-cognac-soft text-cognac border border-cognac/30 transition-all";
      } else {
        pill.className = "step-pill px-3 py-2.5 rounded-xl bg-linen-50 text-charcoal-600 border border-charcoal-900/10 transition-all";
      }
    });
  }

  function renderLiveSchedule(flashId = null) {
    const listEl = document.getElementById("live-bookings-list");
    const reminderBtn = document.getElementById("trigger-reminder-btn");
    const reminderDesc = document.getElementById("reminder-card-desc");
    if (!listEl) return;

    listEl.innerHTML = scheduleBookings
      .slice(0, 4)
      .map((b) => {
        const st = STATUS_MAP[b.status] || STATUS_MAP.scheduled;
        const highlight = b.isUserDemo ? "border-cognac/60 bg-white/[0.08]" : "border-white/10 bg-white/[0.03]";
        const flash = flashId === b.id ? "slot-flash" : "";
        return `<div class="p-3.5 rounded-2xl border ${highlight} ${flash} flex flex-col gap-2 transition-all">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="font-mono text-[10.5px] font-bold ${b.isUserDemo ? "text-[#E6A47C]" : "text-linen-200/50"}">#${escapeHtml(b.id)}</span>
              <span class="text-xs font-bold text-white truncate">${escapeHtml(b.clientName)}</span>
              ${b.isUserDemo ? `<span class="px-1.5 py-0.5 rounded bg-cognac text-white font-mono text-[9px] uppercase">Ваша</span>` : ""}
            </div>
            <span class="px-2 py-0.5 rounded-full border font-mono text-[9.5px] shrink-0 ${st.cls}">${st.label}</span>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-linen-200/75">
            <span>${escapeHtml(b.serviceTitle)} · <strong class="text-white font-medium">${escapeHtml(b.barberName)}</strong></span>
            <span class="font-mono text-white font-semibold">${escapeHtml(b.dateLabel)}, ${escapeHtml(b.time)} · ${formatRub(b.price)}</span>
          </div>
        </div>`;
      })
      .join("");

    const userBooking = scheduleBookings.find((b) => b.id === session.activeBookingId && b.status !== "cancelled");
    if (reminderBtn && reminderDesc) {
      if (userBooking && userBooking.status === "scheduled") {
        reminderBtn.disabled = false;
        reminderBtn.textContent = `⏩ Перемотать время: ${subtractTwoHours(userBooking.time)} (за 2 ч до визита)`;
        reminderDesc.textContent = `Запись #${userBooking.id} создана! Планировщик APScheduler поставил задачу напоминания на ${subtractTwoHours(userBooking.time)}. Нажмите кнопку ниже, чтобы проверить, как бот напишет клиенту:`;
      } else if (userBooking && userBooking.status === "reminded") {
        reminderBtn.disabled = true;
        reminderBtn.textContent = "✓ Напоминание отправлено в чат — ответьте в боте →";
        reminderDesc.textContent = "Бот отправил клиенту напоминание за 2 часа до стрижки. Нажмите «Подтверждаю», «Перенести» или «Отменить» прямо в чате справа.";
      } else if (userBooking && userBooking.status === "confirmed") {
        reminderBtn.disabled = false;
        reminderBtn.textContent = "↻ Отправить напоминание повторно";
        reminderDesc.textContent = `Клиент подтвердил визит #${userBooking.id} в 1 клик — риск неявки снижен, мастер видит зелёный статус в расписании.`;
      } else {
        reminderBtn.disabled = true;
        reminderBtn.textContent = "⏩ Перемотать время: за 2 часа до визита";
        reminderDesc.textContent = "Оформите запись в боте справа — после подтверждения вы сможете нажать эту кнопку и вживую увидеть авто-напоминание за 2 часа.";
      }
    }
  }

  function pushAdminNotification(text) {
    const box = document.getElementById("admin-push-box");
    const txt = document.getElementById("admin-push-text");
    const tm = document.getElementById("admin-push-time");
    if (!box || !txt) return;
    txt.textContent = text;
    if (tm) tm.textContent = getNowTimeStr();
    box.classList.remove("hidden");
    box.classList.add("flex", "tg-msg-enter");
  }

  return {
    recordBotEvent,
    updateStepPills,
    renderLiveSchedule,
    pushAdminNotification
  };
}
